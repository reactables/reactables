import { useRef } from 'react';
import { HubFactory } from '@hub-fx/core';

export const useHub = () => {
  return useRef(HubFactory()).current;
};
