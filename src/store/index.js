import { createContext, useContext } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const students = [
    { id: 1, name: "Ram" },
    { id: 2, name: "Shyam" },
    { id: 3, name: "Mohan" },
  ];

  const attendance = [
    { id: 1, status: "present" },
    { id: 2, status: "absent" },
    { id: 3, status: "present" },
  ];

  const fees = [
    { id: 1, amount: 5000, status: "paid" },
    { id: 2, amount: 3000, status: "pending" },
    { id: 3, amount: 2000, status: "paid" },
  ];

  return (
    <AppContext.Provider value={{ students, attendance, fees }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);