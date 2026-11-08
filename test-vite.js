import { createServer } from "vite";
import React from "react";
import ReactDOMServer from "react-dom/server";

async function test() {
  const rootDir = "D:/Prem Jatol/Tablly/mms-restaurant-admin";
  const server = await createServer({
    root: rootDir,
    server: { middlewareMode: true }
  });

  try {
    const cardMod = await server.ssrLoadModule("/src/pages/subscription/components/SubscriptionOverviewCard.jsx");
    const plansMod = await server.ssrLoadModule("/src/pages/subscription/components/AvailablePlansSection.jsx");
    const historyMod = await server.ssrLoadModule("/src/pages/subscription/components/PlanHistoryAndTickets.jsx");

    const mockSub = {
      packageName: "Basic",
      price: 999,
      duration: "30_days",
      durationDisplay: "30 Days (1 Month)",
      startDate: "2026-11-07T00:00:00.000Z",
      endDate: "2027-03-07T00:00:00.000Z",
      daysRemaining: 119,
      maxTables: 15,
      features: ["qr", "website"],
      status: "active"
    };

    const mockPkgs = [
      {
        _id: "pkg1",
        name: "Basic",
        description: "Essential plan",
        price: 999,
        maxTables: 15,
        features: ["qr", "website"],
        pricing: [
          { duration: "1_month", price: 999, durationDisplay: "1 Month" }
        ]
      }
    ];

    console.log("1. Testing SubscriptionOverviewCard...");
    const cardHtml = ReactDOMServer.renderToString(React.createElement(cardMod.default, {
      subscription: mockSub,
      hasPendingPayment: false,
      pendingPayment: null,
      onRenew: () => {},
      onChangePlan: () => {},
      onRaiseTicket: () => {}
    }));
    console.log("Card HTML length:", cardHtml.length);

    console.log("2. Testing AvailablePlansSection...");
    const plansHtml = ReactDOMServer.renderToString(React.createElement(plansMod.default, {
      packages: mockPkgs,
      currentSubscription: mockSub,
      onSelectPackage: () => {}
    }));
    console.log("Plans HTML length:", plansHtml.length);

    console.log("3. Testing PlanHistoryAndTickets...");
    const historyHtml = ReactDOMServer.renderToString(React.createElement(historyMod.default, {
      history: [],
      tickets: [],
      onViewScreenshot: () => {},
      onRaiseTicket: () => {}
    }));
    console.log("History HTML length:", historyHtml.length);

    console.log("ALL THREE SECTIONS RENDERED WITH ZERO ERRORS!");
  } catch (err) {
    console.error("SECTION RENDER ERROR:", err);
  } finally {
    await server.close();
  }
}

test();
