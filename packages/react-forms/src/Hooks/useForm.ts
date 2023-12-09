import { useReactable } from '@reactables/react-helpers';
import { AbstractControlConfig, RxForm } from '@reactables/forms';

export const useForm = (config: AbstractControlConfig) => {
  const rxForm = useReactable(RxForm.build(config));

  return rxForm;
};
