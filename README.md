# The World on 24 November 2026 in One Image

An entry for the make.fun bounty `news-image-20261124`:
"Sum up 24 November's world news in one image."

`main.ts` is a dependency-free Node 22 program that paints a
1024x1024 front-page collage entirely in code and writes it as a
PNG to `/output/entry.png` (or to `$MAKEFUN_OUTPUT_DIR/entry.png`
when that variable is set). It uses only the Node standard library,
touches no network, and is deterministic: two runs produce
byte-identical output.

## The picture

The hero story is the launch of Shenzhou-24, which carried two
Chinese astronauts and the first Pakistani astronaut toward the
Tiangong space station (AP, 24 Nov 2026). Around it, the day's
other major stories, each researched from reports dated
24 November 2026:

- Nvidia chief Jensen Huang reinstated after 11 days of disorder;
  the board joins him under scrutiny and AI stocks slide (AP/Reuters).
- Ukrainian naval drones strike a Russian warship off Benghazi,
  Libya; two Libyan naval officers die of their wounds (AP).
- Fourteen countries affirm the ICJ ruling that Myanmar committed
  genocide against the Rohingya; the UK adds sanctions (UN News /
  Horizon, 24 Nov 2026).
- The US prepares new tariffs on China, the EU and 14 other
  economies after its excess-capacity probe (AP/Reuters).
- A US jury convicts Huawei of conspiracy to steal trade secrets
  and fraud (AP/Al Jazeera).
- A magnitude 5.6 earthquake strikes Nepal's Koshi province near
  the Chinese border (Horizon).
- Armed men hold about 25 hostages in a Cartagena supermarket
  after a failed armoured-truck robbery (AP).
- UN chief Antonio Guterres calls for a multilateral framework to
  limit AI risks within a year (UN News / Horizon).
- Bangladesh's ousted prime minister Sheikh Hasina announces a
  return home on 16 December (AP/Reuters).

## Run it

```sh
mkdir -p out
MAKEFUN_OUTPUT_DIR=out node main.ts
# writes out/entry.png
```

Licensed under the MIT License, see `LICENSE`.
