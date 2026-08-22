<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IMPERIAL PHYSICS OBSERVATORY | V1 STELLAR NAVIGATOR</title>
    <style>
        body {
            background: #0a0a0a;
            color: #e0e0e0;
            font-family: 'Courier New', Courier, monospace;
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .console-box {
            width: min(90vw, 800px);
            background: #111;
            border: 4px solid #333;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.8);
            box-sizing: border-box;
        }
        h1 {
            font-size: 18px;
            color: #ff6600;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-top: 0;
            text-align: center;
        }
        .input-group {
            display: flex;
            gap: 10px;
            margin-bottom: 25px;
            justify-content: center;
        }
        input[type="number"] {
            background: #000;
            border: 2px solid #555;
            color: #00ff66;
            padding: 12px;
            font-size: 18px;
            font-family: monospace;
            width: 200px;
            border-radius: 6px;
            text-align: center;
        }
        button {
            background: #ff6600;
            color: #000;
            border: none;
            padding: 12px 24px;
            font-weight: bold;
            font-family: monospace;
            font-size: 16px;
            border-radius: 6px;
            cursor: pointer;
            text-transform: uppercase;
        }
        button:hover {
            background: #ff8833;
        }
        .telemetry-screen {
            background: #000;
            border: 2px solid #222;
            border-radius: 8px;
            padding: 20px;
            min-height: 200px;
            font-family: monospace;
        }
        .data-row {
            margin: 8px 0;
            font-size: 14px;
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #1a1a1a;
            padding-bottom: 4px;
        }
        .data-label { color: #888; }
        .data-value { color: #00ff66; font-weight: bold; }
        .external-link {
            display: block;
            margin-top: 20px;
            text-align: center;
            color: #3399ff;
            text-decoration: none;
            font-weight: bold;
        }
        .external-link:hover { text-decoration: underline; }
    </style>
</head>
<body>

<div class="console-box">
    <h1>Stellar Index Navigator</h1>
    <div class="input-group">
        <input type="number" id="nodeInput" placeholder="ENTER ID (e.g. 2262)" min="1" max="100000">
        <button onclick="lookupNode()">ACQUIRE</button>
    </div>

    <div class="telemetry-screen" id="telemetryScreen">
        <div style="color: #666; text-align: center; padding-top: 60px;">STANDBY FOR TARGET INPUT...</div>
    </div>
</div>

<script>
    // Lightweight static sample registry (simulating your repo JSON lookup)
    const localNodeCache = {
        920: { id: "NODE-00000920-T1", tier: 1, dist_pc: 8.03, dist_ly: 26.20, ra: 62.4586, dec: 13.9159, mag: 12.1, harmonic: 1.8659 },
        2262: { id: "NODE-00002262-T2", tier: 2, dist_pc: 44.58, dist_ly: 145.41, ra: 129.5800, dec: -16.0713, mag: 13.08, harmonic: 0.1552 },
        15000: { id: "NODE-00015000-T4", tier: 4, dist_pc: 218.14, dist_ly: 711.47, ra: 3.8151, dec: 52.1121, mag: 13.03, harmonic: 0.0549 }
    };

    function lookupNode() {
        const val = document.getElementById('nodeInput').value;
        const screen = document.getElementById('telemetryScreen');
        
        // In your production repo, this would fetch from a hosted nodes.json file:
        // fetch('nodes.json').then(res => res.json()).then(data => { ... })
        
        const node = localNodeCache[val];
        
        if (!node) {
            screen.innerHTML = `<div style="color: #ff3333; text-align: center; padding-top: 60px;">TARGET #${val} NOT FOUND IN STATIC BUFFER.</div>`;
            return;
        }

        const stellariumUrl = `https://stellarium-web.org/skysource?ra=${node.ra}&dec=${node.dec}&fov=1.0`;

        screen.innerHTML = `
            <div class="data-row"><span class="data-label">TARGET ID:</span> <span class="data-value">${node.id}</span></div>
            <div class="data-row"><span class="data-label">SHELL TIER:</span> <span class="data-value">TIER ${node.tier}</span></div>
            <div class="data-row"><span class="data-label">DISTANCE (PC):</span> <span class="data-value">${node.dist_pc} pc</span></div>
            <div class="data-row"><span class="data-label">DISTANCE (LY):</span> <span class="data-value">${node.dist_ly} ly</span></div>
            <div class="data-row"><span class="data-label">RIGHT ASCENSION:</span> <span class="data-value">${node.ra}°</span></div>
            <div class="data-row"><span class="data-label">DECLINATION:</span> <span class="data-value">${node.dec}°</span></div>
            <div class="data-row"><span class="data-label">HARMONIC SIG:</span> <span class="data-value">${node.harmonic}</span></div>
            <a class="external-link" href="${stellariumUrl}" target="_blank">[ LAUNCH VISUAL DEEP-LINK IN STELLARIUM ]</a>
        `;
    }
</script>

</body>
</html>
