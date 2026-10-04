import { TextField, type TextFieldClearableProps } from "@toss/tds-mobile";
import "./growth.css";

// TDS owns the inner 20px inset; cancel only the surrounding inset in these panels.
export function FeatureTextField(props: TextFieldClearableProps) {
  return <div className="growth-text-field">
    <TextField.Clearable labelOption="sustain" paddingTop={0} paddingBottom={0}
      aria-label={props.label} {...props} />
  </div>;
}
