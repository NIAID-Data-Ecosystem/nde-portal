export {};
// import { useState } from 'react';
// import {
//   Box,
//   ButtonProps,
//   Flex,
//   Input,
//   InputProps,
//   Text,
//   theme,
// } from 'nde-design-system';
// import Select, { components, OptionProps, ControlProps } from 'react-select';

// interface EnumInputProps {
//   field: string;
//   isDisabled: boolean;
//   options: string[];
//   handleSubmit: (args: { term: string; querystring: string }) => void;
//   renderSubmitButton?: (props: ButtonProps) => React.ReactElement;
// }

// export const EnumInput: React.FC<EnumInputProps> = ({
//   field,
//   isDisabled,
//   options,
//   handleSubmit,
//   renderSubmitButton,
// }) => {
//   const selectOptions = [...options.map(value => ({ label: value, value }))];
//   const defaultOption = selectOptions[0];
//   const [selectedOption, setSelectedOption] = useState<{
//     label: string;
//     value: string;
//   } | null>(defaultOption);

//   return (
//     <Flex
//       as='form'
//       w='100%'
//       alignItems='center'
//       onSubmit={e => {
//         e.preventDefault();
//         handleSubmit({
//           term: selectedOption?.label || '',
//           querystring: selectedOption?.value || '',
//         });
//       }}
//     >
//       <Select
//         defaultValue={defaultOption}
//         isDisabled={isDisabled}
//         isSearchable={true}
//         name={`${field} options`}
//         options={['']}
//         onChange={(option: any) => {
//           setSelectedOption(option);
//         }}
//         styles={{
//           container: base => ({ ...base, flex: 1 }),
//           control: base => ({
//             ...base,
//             borderColor: theme.colors.gray[200],
//             boxShadow: 'none',
//             ':hover': {
//               borderColor: theme.colors.gray[200],
//             },
//             ':focus': {
//               borderColor: theme.colors.primary[500],
//               boxShadow: `0 0 0 1px ${theme.colors.primary[600]}`,
//             },
//             ':focus-within': {
//               borderColor: theme.colors.primary[500],
//               boxShadow: `0 0 0 1px ${theme.colors.primary[600]}`,
//             },
//           }),
//           option: (base, { isFocused, isSelected }) => ({
//             ...base,
//             cursor: 'pointer',
//             backgroundColor: isSelected
//               ? theme.colors.primary[500]
//               : isFocused
//               ? theme.colors.primary[100]
//               : 'transparent',
//             color: isSelected ? 'white' : theme.colors.text.body,
//             ':hover': {
//               background: isSelected
//                 ? theme.colors.primary[500]
//                 : theme.colors.primary[100],
//             },
//           }),
//         }}
//       />
//       <Flex mx={2}>
//         {renderSubmitButton &&
//           renderSubmitButton({
//             type: 'submit',
//             w: '100%',
//           })}
//       </Flex>
//     </Flex>
//   );
// };
