import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import * as objectPath from 'object-path';
import { OperatorFunction, pipe } from 'rxjs';

import { ChannelType, BusType } from '../types';
import { MixerState } from './mixer-state.models';

type Projector<T> = (state: MixerState) => T;
type Selector<T> = (...args: any[]) => Projector<T>;

/**
 * RxJS operator to apply a custom projecton to the full mixer state.
 * @param projector Projector function generated by a selector
 */
export const select = <T>(
  projector: Projector<T>
): OperatorFunction<MixerState, T> =>
  pipe(
    map(state => projector(state)),
    distinctUntilChanged(),
    filter(e => e !== undefined)
  );

/**
 * Internal helper function to select parts of the nested state object
 * @param state The full mixer state
 * @param path The path to select from the nested object, segment by segment
 */
function getStatePath<T>(
  state: MixerState,
  path: (string | number)[],
  defaultValue = undefined
) {
  return objectPath.get<T>(state, path, defaultValue);
}

/**************************** */

/**
 * Internal helper function to select a property from a channel.
 * Differentiates between master and aux/fx bus
 * @param property The property to select
 * @param channelType
 * @param channel
 * @param busType
 * @param bus
 */
const selectGenericChannelProperty: Selector<number> = (
  property: string,
  defaultValue = undefined,
  channelType: ChannelType,
  channel: number,
  busType: BusType,
  bus?: number
) => {
  return state => {
    switch (busType) {
      case 'master':
        return getStatePath<number>(
          state,
          [channelType, channel - 1, property],
          defaultValue
        );
      case 'aux':
      case 'fx':
        return getStatePath<number>(
          state,
          [channelType, channel - 1, busType, bus - 1, property],
          defaultValue
        );
    }
  };
};

/**
 * Select level value of the master fader
 */
export const selectMasterValue: Selector<number> = () => state =>
  getStatePath<number>(state, ['m', 'mix']);

/**
 * Select pan value of the master fader
 */
export const selectMasterPan: Selector<number> = () => state =>
  getStatePath<number>(state, ['m', 'pan']);

/**
 * Select dim value of the master fader
 */
export const selectMasterDim: Selector<number> = () => state =>
  getStatePath<number>(state, ['m', 'dim']);

/**
 * Select pan value of a channel
 * @param channelType Type of the channel
 * @param channel Channel number
 * @param busType Type of the bus
 * @param bus bus number
 */
export const selectPan: Selector<number> = (
  channelType: ChannelType,
  channel: number,
  busType: BusType,
  bus?: number
) => selectGenericChannelProperty('pan', 0, channelType, channel, busType, bus);

/**
 * Select mute value of a channel
 * @param channelType
 * @param channel
 * @param busType
 * @param bus
 */
export const selectMute: Selector<number> = (
  channelType: ChannelType,
  channel: number,
  busType: BusType,
  bus?: number
) =>
  selectGenericChannelProperty('mute', 0, channelType, channel, busType, bus);

/**
 * Select solo value of a channel
 * @param channelType
 * @param channel
 */
export const selectSolo: Selector<number> = (
  channelType: ChannelType,
  channel: number
) => {
  return state =>
    getStatePath<number>(state, [channelType, channel - 1, 'solo']);
};

/**
 * Select fader value of a channel
 * @param channelType
 * @param channel
 * @param busType
 * @param bus
 */
export const selectFaderValue: Selector<number> = (
  channelType: ChannelType,
  channel: number,
  busType: BusType,
  bus?: number
) => {
  return state => {
    switch (busType) {
      case 'master':
        return getStatePath<number>(state, [channelType, channel - 1, 'mix']);
      case 'aux':
      case 'fx':
        return getStatePath<number>(state, [
          channelType,
          channel - 1,
          busType,
          bus - 1,
          'value',
        ]);
    }
  };
};

/**
 * Select "post" value of a send channel
 * @param channelType
 * @param channel
 */
export const selectPost: Selector<number> = (
  channelType: ChannelType,
  channel: number,
  busType: BusType,
  bus: number
) => {
  return state =>
    getStatePath<number>(state, [
      channelType,
      channel - 1,
      busType,
      bus,
      'post',
    ]);
};

/**
 * Select "p" value of a send channel
 * @param channelType
 * @param channel
 */
export const selectAuxPostProc: Selector<number> = (
  channelType: ChannelType,
  channel: number,
  aux: number
) => {
  return state =>
    getStatePath<number>(state, [
      channelType,
      channel - 1,
      'aux',
      aux,
      'postproc',
    ]);
};
