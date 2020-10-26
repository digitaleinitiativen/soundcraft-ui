export type ChannelType = 'i' | 'l' | 'p' | 'f' | 's' | 'a' | 'v';
export type BusType = 'master' | 'aux' | 'fx';

export enum ConnectionEvent {
  Connected = 'CONNECTED',
  Disconnected = 'DISCONNECTED',
  Ready = 'READY',
}
