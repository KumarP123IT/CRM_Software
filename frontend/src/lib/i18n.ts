import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const en = {
  nav: {
    home: "Home",
    marketing: "Marketing",
    sales: "Sales",
    automation: "Automation",
    reports: "Reports",
    dashboard: "Dashboard",
    conversations: "Conversations",
    contacts: "Contacts",
    groups: "Groups",
    broadcasts: "Broadcasts",
    campaigns: "Campaigns",
    templates: "Templates",
    ads: "Ads",
    leads: "Leads",
    calls: "Calls",
    bots: "Bots",
    aiAgents: "AI Agents",
    commentAutomation: "Comment Automation",
    analytics: "Analytics",
    settings: "Settings",
    inbox: "Inbox",
    more: "More",
  },
  dashboard: {
    greeting_morning: "Good morning, {{name}}",
    greeting_afternoon: "Good afternoon, {{name}}",
    greeting_evening: "Good evening, {{name}}",
    subtitle: "Here's what's happening with your customers today.",
  },
  onboarding: {
    title: "Get set up",
    connect: "Connect WhatsApp",
    import: "Import contacts",
    template: "Create a message template",
    invite: "Invite a teammate",
    broadcast: "Send your first broadcast",
  },
};

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: { en: { translation: en } },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });
}

export default i18n;
