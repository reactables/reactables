import { ControlRef } from '../Models/ControlRef';

export const isChildRef = (controlRef: ControlRef, parentRef: ControlRef) => {
  return (
    parentRef.every((key, index) => controlRef[index] === key) &&
    controlRef.length === parentRef.length + 1
  );
};
