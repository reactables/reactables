import { useMemo } from 'react';
import { useReactable } from '@reactables/react-helpers';
import { AbstractControlConfig, RxForm } from '@reactables/forms';

export const useForm = (config: AbstractControlConfig) => {
  const form = useMemo(() => RxForm.build(config), []);
  const rxForm = useReactable(form);

  return rxForm;
};
