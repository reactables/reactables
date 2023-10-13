import { ControlRef } from '../Models';
export const getFormKey = (controlRef: ControlRef) =>
  controlRef.length ? controlRef.join('.') : 'root';
