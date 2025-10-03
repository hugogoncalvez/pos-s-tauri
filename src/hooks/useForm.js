import { useCallback, useState, useRef } from "react"


export const useForm = (initialState = {}) => {

  const [values, setValues] = useState(initialState)
  const initialValuesRef = useRef(initialState); // Store initial state

  //console.log({ keyFilter })

  const reset = useCallback((newStateOrKey) => {
    if (typeof newStateOrKey === 'string') {
      setValues(prevValues => ({
        ...prevValues,
        [newStateOrKey]: initialValuesRef.current[newStateOrKey] !== undefined ? initialValuesRef.current[newStateOrKey] : '' // Reset to initial value or empty string
      }));
    } else if (typeof newStateOrKey === 'object') {
      setValues(newStateOrKey);
    } else {
      setValues(initialValuesRef.current); // Reset to the original initial state
    }
  }, []);
  const resetArray = (claves) => {
    //  console.log(claves)
    if (typeof values !== 'undefined') {
      let borrador = structuredClone(values)
      claves.map((clave) =>
        delete borrador[clave]
      )
      //  console.log({ borrador })\n      setValues(borrador)
    }
  }

  // const claveFil = ({ target }) => {
  //   // console.log({ target })
  //   const clave = target.name
  //   //console.log({ clave })
  //   setKeyFilter(clave)
  // }

  const handleInputChange = useCallback(({ target, value: directValue }) => {
    const clave = target?.name; // Use optional chaining for target.name
    let finalValue;

    if (target && target.value !== undefined) { // Prioritize target.value if it exists
      finalValue = target.value;
    } else if (directValue !== undefined) { // Otherwise, use the directValue
      finalValue = directValue?.id !== undefined ? directValue.id : directValue;
    } else {
      finalValue = ''; // Default to empty string if neither is found
    }

    if (clave) { // Only update if a valid name (clave) is found
      setValues(prevValues => ({
        ...prevValues,
        [clave]: finalValue
      }));
    }
  }, []);
  return [values, handleInputChange, reset, resetArray, setValues]
}