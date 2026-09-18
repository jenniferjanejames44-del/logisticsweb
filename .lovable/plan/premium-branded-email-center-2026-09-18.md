# Premium Branded Email Center

## Goal
Upgrade only the Admin Email Center so messages look and feel like polished campaigns from leading email platforms, while preserving the working queue, contacts, scheduling, attachments, personalization, and delivery tracking.

## What will change

### 1. One premium email design everywhere
- Replace the basic email shell with a refined RAC Logistics layout: preheader, branded navy masthead, strong content hierarchy, orange calls to action, service/value strip, polished attachment block, contact details, social links, and a professional legal footer.
- Make the delivered email and the Admin preview use the same visual structure so what the admin approves is what the customer receives.
- Keep the email table-based, mobile-friendly, and compatible with Gmail, Outlook, Apple Mail, and common mobile clients.

### 2. Premium template gallery
- Redesign the template selection screen with visual thumbnail previews, clear categories, and stronger starting templates.
- Refresh the built-in content for proposals, partnerships, outreach, introductions, follow-ups, and sales proposals with premium headings, highlights, structured sections, and clear calls to action.
- Preserve saved templates and the blank-email option.

### 3. Better composing experience
- Refine the writing workspace into a cleaner campaign editor with subject guidance, personalization tokens, a more polished formatting toolbar, attachments, and a larger live preview.
- Keep desktop and mobile preview modes, test sending, draft saving, scheduling, and recipient selection.
- Use the existing RAC dashboard design system and controls; no unrelated dashboard or website pages will change.

### 4. Premium review and send flow
- Improve the preview and final review screens so the admin can clearly verify sender, recipients, subject, attachments, personalization, and delivery timing before sending.
- Improve Email Center tabs, template management, history, and delivery presentation without changing their business logic.

### 5. Delivery integration
- Update the Email Center sending function to render the new premium shell while preserving the repaired queue behavior, unique retry keys, sender domain, personalized variables, and secure attachment links.
- Deploy the updated sending function after the visual changes.

## Technical details
- Consolidate the browser preview and delivered email markup around matching design rules to prevent visual drift.
- Escape company-controlled text and URLs where appropriate, keep customer-authored rich content intact, and retain plain-text fallbacks.
- Use inline styles and email-safe table layouts for inbox compatibility.
- No database schema, pricing, warehouse, zone, homepage, auth, or payment changes.

## Verification
- Check the Email Center at desktop and mobile widths.
- Verify all composer steps, templates, saved drafts, recipient selection, preview switching, attachments, and send review.
- Confirm the delivered HTML includes personalization, branding, links, attachments, and responsive behavior.
- Run the relevant project checks and deploy the updated email sender.
