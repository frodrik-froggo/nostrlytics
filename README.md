# Nostrlytics

This is an experimental project to create a simple analytics library that can be used to track user interactions on a website without exposing the data to any one third party.

### Why?
Some people writing blogs or running small websites might not want to use Google Analytics or other third party analytics services or are unable or don't want to run their own infrastructure. This project aims to provide a simple way to track user interactions on a website without exposing the data to any third party.

### How?
All interaction events are sent to nostr relay in encrypted form. The only one who can analyze the data is the website owner who has access to the encryption key. The data included in the events is minimal and does not include any personal information.
It contains:
- event type (impression or click out)
- timestamp
- page url the event occurred on
- language of the browser
- user agent
- referrer (in case of page impressions event)
- click out url (in case of a click out event)

### How to use?

1. Upload the nostrlytics scripts in `assets` to your website.

2. Add the nostrlytics script to your website inside the `<head>` tag.
```html
  <script>
  document.nostrlyticsConfig ={
    relays: [
      'wss://relay.damus.io',
      'wss://relay.snort.social'
        ...more relays...
    ],
    receiverPubkey: '<your receiver public key>',
    countImpressions: true,
    countClickOuts: true,
  }
</script>
<meta charset='utf-8' />
<script type="module" crossorigin src="/<path to your files>/assets/index-Bfjtchap.js"></script>
```

3. Checkout https://github.com/frodrik-froggo/nostrlytics-frontend for a sample frontend that displays events from nostrlytics. You can also create a dedicated private/public key pair in the frontend for your website and use the public key in this nostrlytics script. 

### Acknowledgements:

* project is based on vite vanilla typescript template at https://github.com/doinel1a/vite-vanilla-ts