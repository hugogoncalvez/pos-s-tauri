import React, { createContext, useState, useMemo } from 'react';
import { usePreventClose } from '../hooks/usePreventClose';

export const PreventCloseContext = createContext({
  setCheckFunction: () => {},
});

export const PreventCloseProvider = ({ children }) => {
  const [checkFunction, setCheckFunction] = useState(null);

  const handleSetCheckFunction = (func) => {
    setCheckFunction(() => func);
  };

  // El hook se llama aquí, en un componente que nunca se desmonta.
  // Se le pasa la función de verificación actual del estado.
  usePreventClose(checkFunction, null);

  const value = useMemo(() => ({
    setCheckFunction: handleSetCheckFunction,
  }), []);

  return (
    <PreventCloseContext.Provider value={value}>
      {children}
    </PreventCloseContext.Provider>
  );
};
