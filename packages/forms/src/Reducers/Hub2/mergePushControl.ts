import { Form, BaseForm, Hub2Fields, FormControl } from '../../Models/Controls';
import { getFormKey } from '../../Helpers/getFormKey';
import { getControlBranch } from '../../Helpers/getControlBranch';
import { ControlRef } from '../../Models/ControlRef';
import { FormErrors } from '../../Models/FormErrors';
import { getDescendantControls } from '../../Helpers/getDescendantControls';
import { getAncestorControls } from '../../Helpers/getAncestorControls';

const hasErrors = (errors: FormErrors) => {
  return Object.values(errors).some((hasError) => hasError);
};

export const mergePushControl = <T>(state: Form<T>, form: BaseForm<T>, controlRef: ControlRef) => {
  //If Form Array
  // use the added control  (last index)
  // merge descendants with default stuff

  //If FormGroup
  // use the control ref
  // merge descendants with default stuff

  // Get the valid state of added control
  // recursiely check ancestors,,,, children can only turn their parent false  - not the other way

  return state;
};
