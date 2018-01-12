# foxhole-artillery-calc
https://earthgrazer.github.io/foxhole-artillery-calc/

Artillery calculator for [Foxhole](https://www.foxholegame.com/).

In Foxhole, indirect fire weapons like the Howitzer, Mortar, and Field Artillery are aimed by setting the distance and azimuth (angle) to a target. Since the artillery operator has no visual aid to show where those target values land, it is imperative that a spotter be brought along to complete the artillery crew. The spotter role uses binoculars to determine the exact distance and angle to a target from where he stands, and relays this information to the artillery operator to coordinate a strike.

A challenge that an artillery crew faces is when the spotter cannot call out shots from the same location as the artillery, such is the case with the Howitzer. Binoculars have a maximum range of 120 meters, while the Howitzer can hit up to a maximum of 150 meters. To maximize the Howitzer's range, the spotter must be positioned far in front of it in order to bring a target at max range into view. This change in relative positioning often causes shots to be wildly inaccurate when estimated by eye.

This webapp takes the distance and azimuth values of the artillery and target relative to the spotter, and computes the distance and azimuth values to the target relative to the artillery. **This allows the spotter to accurately call out fire missions without having to be positioned right next to the Howitzer/mortar/artillery**.
