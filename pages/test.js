import React, { useState, useEffect } from "react";
export default function Test() {
  const [x, setX] = useState(0);
  useEffect(() => { setX(1); }, []);
  return <div>Test OK</div>;
}
