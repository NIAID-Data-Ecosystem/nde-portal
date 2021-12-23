import {extendTheme} from "@chakra-ui/react";
import foundations from "./foundations";
import components from "./components";
import styles from "./styles";

/*
Theme extended from Chakra-UI: https://chakra-ui.com/docs/theming/theme
*/
export const theme = extendTheme({
  styles,
  ...foundations,
  components,
});
