/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import AlertingMonitorsService from '../AlertingMonitorsService';

const monitorHit = (id: string, name: string, destinationId?: string) => ({
  _id: id,
  _source: {
    name,
    triggers: [
      {
        document_level_trigger: {
          actions: destinationId ? [{ destination_id: destinationId }] : [],
        },
      },
    ],
  },
});

describe('AlertingMonitorsService', () => {
  it('filters by the indexed monitor_type and returns monitors matching destination_id client-side', async () => {
    const post = jest.fn().mockResolvedValue({
      ok: true,
      resp: {
        hits: {
          hits: [
            monitorHit('id-1', 'monitor-1', 'config-id-1'),
            monitorHit('id-2', 'monitor-2', 'config-id-2'),
            monitorHit('id-3', 'monitor-3', 'config-id-1'),
          ],
        },
      },
    });
    const service = new AlertingMonitorsService({ post } as any);

    const monitors = await service.getMonitorsUsingDestination('config-id-1');

    expect(monitors).toEqual([
      { id: 'id-1', name: 'monitor-1' },
      { id: 'id-3', name: 'monitor-3' },
    ]);
    const [, options] = post.mock.calls[0];
    const sentBody = JSON.parse(options.body);
    expect(sentBody.query.query.term['monitor.monitor_type']).toBe('active_response_monitor');
    expect(options.query).toBeUndefined();
  });

  it('matches actions across the different trigger shapes', async () => {
    const post = jest.fn().mockResolvedValue({
      ok: true,
      resp: {
        hits: {
          hits: [
            {
              _id: 'id-1',
              _source: {
                name: 'monitor-1',
                triggers: [
                  { query_level_trigger: { actions: [{ destination_id: 'config-id-1' }] } },
                ],
              },
            },
          ],
        },
      },
    });
    const service = new AlertingMonitorsService({ post } as any);

    expect(await service.getMonitorsUsingDestination('config-id-1')).toEqual([
      { id: 'id-1', name: 'monitor-1' },
    ]);
  });

  it('forwards dataSourceId as a query param when set', async () => {
    const post = jest.fn().mockResolvedValue({ ok: true, resp: { hits: { hits: [] } } });
    const service = new AlertingMonitorsService({ post } as any, 'ds-1');

    await service.getMonitorsUsingDestination('config-id-1');

    const [, options] = post.mock.calls[0];
    expect(options.query).toEqual({ dataSourceId: 'ds-1' });
  });

  it('returns an empty list when no monitors reference the destination', async () => {
    const post = jest.fn().mockResolvedValue({
      ok: true,
      resp: { hits: { hits: [monitorHit('id-1', 'monitor-1', 'other-config-id')] } },
    });
    const service = new AlertingMonitorsService({ post } as any);

    expect(await service.getMonitorsUsingDestination('config-id-1')).toEqual([]);
  });

  it('returns an empty list when the response has no hits', async () => {
    const post = jest.fn().mockResolvedValue({ ok: true, resp: {} });
    const service = new AlertingMonitorsService({ post } as any);

    expect(await service.getMonitorsUsingDestination('config-id-1')).toEqual([]);
  });

  it('throws when the response is not ok', async () => {
    const post = jest.fn().mockResolvedValue({ ok: false, resp: 'boom' });
    const service = new AlertingMonitorsService({ post } as any);

    await expect(service.getMonitorsUsingDestination('config-id-1')).rejects.toThrow();
  });
});
