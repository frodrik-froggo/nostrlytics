import {
  finalizeEvent,
  generateSecretKey,
  getPublicKey,
  nip04,
  Relay,
  SimplePool
} from 'nostr-tools';
// eslint-disable-next-line import/no-unresolved
import { VerifiedEvent } from 'nostr-tools/core';
// eslint-disable-next-line import/no-unresolved
import { normalizeURL } from 'nostr-tools/utils';

import { NostrlyticsConfig } from './nostrlytics-config.ts';
import {
  NostrlyticsClickOutData,
  NostrlyticsImpressionData
} from './nostrlytics-data.ts';

export class Nostrlytics {
  private static relays: string[] = [];
  private static receiverPubkey: string;
  private static myPrivkey: Uint8Array;
  private static myPubkey: string;
  private static pool: SimplePool;
  private static relay: Relay | null;

  public static async init(config: NostrlyticsConfig) {
    if (!config.countImpressions && !config.countClickOuts) {
      return;
    }

    Nostrlytics.relays = config.relays;
    Nostrlytics.receiverPubkey = config.receiverPubkey;
    Nostrlytics.myPrivkey = generateSecretKey();
    Nostrlytics.myPubkey = getPublicKey(Nostrlytics.myPrivkey);
    Nostrlytics.pool = new SimplePool();

    if (config.countImpressions) {
      await Nostrlytics.sendEvent({
        kind: 'nstrly-event',
        type: 'page-impression',
        userAgent: navigator.userAgent,
        language: navigator.language,
        referrer: document.referrer,
        location: window.location.href
      });
    }
    if (config.countClickOuts) {
      document.addEventListener(
        'click',
        async (evt: MouseEvent) => {
          if (!evt.target) {
            return;
          }

          const a = (evt.target as Element).closest(
            'a[data-type="nostrlytics"]'
          ) as HTMLAnchorElement;
          if (a) {
            await Nostrlytics.sendEvent({
              kind: 'nstrly-event',
              type: 'click-out',
              userAgent: navigator.userAgent,
              language: navigator.language,
              clickOutUrl: a.href,
              location: window.location.href
            });
          }
        },
        false
      );
    }
  }

  private static async sendEvent(
    data: NostrlyticsImpressionData | NostrlyticsClickOutData
  ) {
    const ciphertext = await nip04.encrypt(
      Nostrlytics.myPrivkey,
      Nostrlytics.receiverPubkey,
      JSON.stringify(data)
    );

    // TODO add expiration tag
    /*
    ["expiration", "1600000000"]
     */
    const event = {
      kind: 4,
      pubkey: Nostrlytics.myPubkey,
      content: ciphertext,
      tags: [['p', Nostrlytics.receiverPubkey]],
      created_at: Math.floor(Date.now() / 1000)
    };

    const verifiedEvent = finalizeEvent(event, Nostrlytics.myPrivkey);
    const success = await Nostrlytics.scrambleAndPublish(verifiedEvent);
    if (!success) {
      console.log('Failed to publish event on any relay');
    }
  }

  private static async scrambleAndPublish(event: VerifiedEvent) {
    // scramble the list of relays and publish to the first one that works
    // we do this to avoid spamming the same relay or all relays at once
    if (Nostrlytics.relay && Nostrlytics.relay.connected) {
      try {
        await Nostrlytics.relay.publish(event);
        return true;
      } catch (e) {
        Nostrlytics.relay.close();
        Nostrlytics.relay = null;
        console.log(e);
      }
    }

    const relays = Nostrlytics.relays.sort(() => Math.random() - 0.5);
    for (const relayUrl of relays) {
      console.log(`Trying to publish to relay ${relayUrl}`);
      // publish to relay
      try {
        Nostrlytics.relay = await Nostrlytics.pool.ensureRelay(
          normalizeURL(relayUrl),
          {
            connectionTimeout: 1000
          }
        );

        await Nostrlytics.relay.publish(event);
        console.log('...ok');

        return true;
      } catch (e) {
        if (e && (e as Error).message === 'no active subscription') {
          // ignore this error, we don't care about it
          console.log('...ok');
          return true;
        }
        if (Nostrlytics.relay && Nostrlytics.relay.connected) {
          Nostrlytics.relay.close();
        }
        console.log('...failed');
        console.log(e);
      }
    }
    return false;
  }
}
