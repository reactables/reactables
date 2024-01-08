import { useMemo } from 'react';
import { useReactable } from '@reactables/react-helpers';
import { AbstractControlConfig, build } from '@reactables/forms';
import { HookedRxForm } from '../Components/Form';

export const useForm = (config: AbstractControlConfig) => {
  const form = useMemo(() => build(config), []);
  const rxForm = useReactable(form);

  return rxForm as HookedRxForm;
};
