import React from "react";
import PaymentPage from "./pages/payment/PaymentPage.jsx";

function App() {
  return (
    <>
      <PaymentPage />
    </>
  );
}

export default App;
import Records from "./pages/Records.jsx"; // Records is .js

const DEMO_PATIENT_ID = "000000000000000000000001";
const ROLE = "Provider";

export default function App() {
  return <Records patientId={DEMO_PATIENT_ID} role={ROLE} />;
}
