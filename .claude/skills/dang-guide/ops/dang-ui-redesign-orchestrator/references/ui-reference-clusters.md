<!-- File: Distilled UI reference clusters for DangApp redesign planning. -->
# UI Reference Clusters

Use this file to normalize deep research into DangApp-ready design territories before route mapping.

## Primary Direction
### Modern Trust-Centric Mobile Service
- Best fit for DangApp because it balances:
  - profile credibility
  - calm service trust
  - matching and chat continuity
  - booking clarity
- Borrow:
  - clean card grouping
  - visible trust markers
  - compact but readable mobile hierarchy
  - action-first scheduling and messaging surfaces
- Avoid:
  - hospitality-only storytelling
  - oversized photography that hides operational details

### Strong references
- Airbnb: [airbnb.com](https://www.airbnb.com)
  - strongest for booking clarity, message-to-action transitions, and calm trust framing
- Karrot: [karrotmarket.com](https://www.karrotmarket.com)
  - strongest for local trust cues, neighborhood warmth, and lightweight card/list density
- Toss design cues: [toss.im](https://toss.im)
  - strongest for Korean mobile clarity, action hierarchy, and state handling

## Backup Direction
### Verified Care Marketplace
- Best when DangApp needs to lean harder into:
  - caregiver verification
  - trust and review density
  - booking and service reassurance
- Borrow:
  - verification ladders
  - review and profile evidence blocks
  - booking reassurance copy
- Avoid:
  - over-medical or nanny-only tone
  - marketplace clutter that weakens matching warmth

### Strong references
- Rover: [rover.com](https://www.rover.com)
  - strongest for care provider cards, reviews, and service detail trust
- Momsitter: [momsitter.mom](https://www.momsitter.mom)
  - strongest for Korean verification framing and care-market matching cues
- UrbanSitter: [urbansitter.com](https://www.urbansitter.com)
  - strongest for trust and safety framing around care selection

## Supporting Direction
### Family Organizer Utility
- Best as a supporting layer for:
  - schedules
  - shared ownership
  - reminders and family visibility
- Borrow:
  - calendar clarity
  - shared event structure
  - practical coordination UI
- Avoid:
  - turning the product into a pure planner
  - soft utility screens that ignore trust and service actions

### Strong references
- TimeTree: [timetreeapp.com](https://timetreeapp.com)
  - strongest for shared schedule structure and family event visibility
- Google Calendar: [calendar.google.com](https://calendar.google.com)
  - strongest for event density, date control, and utility clarity

## Trust and Safety Layer
- Use as a cross-cutting support pattern, not the main visual territory.
- Strong references:
  - Bumble safety: [bumble.com/the-buzz/tag/safety](https://bumble.com/the-buzz/tag/safety)
  - UrbanSitter trust and safety: [urbansitter.com](https://www.urbansitter.com)

## Route Fit Notes
- `/onboarding`
  - combine trust framing from Bumble and Momsitter with lightweight clarity from Toss
- `/home`
  - combine Karrot card scannability with Rover trust density
- `/chat`, `/chat/[id]`
  - combine Airbnb action-thread clarity with Kakao-style conversation density
- `/profile`
  - combine Rover trust evidence with Bumble-style verification markers
- `/care`
  - lean harder into Airbnb plus Rover
- `/family`, `/schedules`
  - lean harder into TimeTree plus Google Calendar
