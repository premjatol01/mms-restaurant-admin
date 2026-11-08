import React from "react";
import ReactDOMServer from "react-dom/server";
import SubscriptionPage from "./src/pages/subscription/SubscriptionPage.jsx";

try {
  const html = ReactDOMServer.renderToString(React.createElement(SubscriptionPage));
  console.log("RENDER SUCCESS, length:", html.length);
} catch (err) {
  console.error("RENDER FAILED:", err);
}
