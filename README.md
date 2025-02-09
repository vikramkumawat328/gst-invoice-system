# GST Invoice Generation System

This system automates the generation of GST invoices using Firebase Cloud Functions and Firestore. It monitors booking documents and automatically processes GST calculations when a booking is marked as finished.

## Features
- Automatic GST invoice generation
- Firestore PubSub triggers
- IGST and SGST/CGST calculations
- GST API integration

## Setup
1. Install dependencies:
```bash
npm install
```

2. Configure Firebase:
```bash
firebase login
firebase init
```

3. Deploy Cloud Functions:
```bash
firebase deploy --only functions
```

## Environment Variables
Create a `.env` file with the following variables:
```
GST_API_KEY=your_api_key
GST_API_ENDPOINT=your_api_endpoint
```

## GST Calculation Logic
- For inter-state transactions: IGST (18%)
- For intra-state transactions: SGST (9%) + CGST (9%)
