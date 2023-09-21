import { useRef } from 'react';
import { HubFactory } from '@hubfx/core';

export const useHub = () => {
  return useRef(HubFactory()).current;
};
