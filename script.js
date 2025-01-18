document.getElementById('gradientForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const type = document.getElementById('type').value;
    const width = parseFloat(document.getElementById('width').value);
    const height = parseFloat(document.getElementById('height').value);
    const diameter = parseFloat(document.getElementById('diameter').value);
    const spacing = parseFloat(document.getElementById('spacing').value);
    const lowpower = parseFloat(document.getElementById('lowpower').value);
    const highpower = parseFloat(document.getElementById('highpower').value);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<LightBurnProject AppVersion="1.7.03" FormatVersion="1" MaterialHeight="0" MirrorX="False" MirrorY="False">\n';

    if (type === 'square' || type === 'rectangle') {
        xml += '  <CutSetting type="Cut">\n';
        xml += '    <index Value="0"/>\n';
        xml += '    <name Value="C00"/>\n';
        xml += '    <maxPower Value="20"/>\n';
        xml += '    <maxPower2 Value="20"/>\n';
        xml += '    <speed Value="100"/>\n';
        xml += '    <priority Value="0"/>\n';
        xml += '  </CutSetting>\n';
        xml += '  <Shape Type="Group">\n';
        xml += '    <XForm>1 0 0 1 0 0</XForm>\n';
        xml += '    <Children>\n';
        xml += `      <Shape Type="Path" CutIndex="0" CutOrder="0" PowerScale="${lowpower}" VertID="0" PrimID="0">\n`;
        xml += `        <XForm>1 0 0 1 0 0</XForm>\n`;
        xml += `        <VertList>V0 0V0 ${height}</VertList>\n`;
        xml += `        <PrimList>L0 1</PrimList>\n`;
        xml += `      </Shape>\n`;
        const numlines = Math.round(width / spacing);
        for (let linenum = 1; linenum <= numlines; linenum++) {
            const powerScale = (lowpower + ((highpower - lowpower) * linenum / numlines)).toFixed(2);
            xml += `      <Shape Type="Path" CutIndex="0" CutOrder="${linenum}" PowerScale="${powerScale}" VertID="0" PrimID="0">\n`;
            xml += `        <XForm>1 0 0 1 ${(spacing * linenum).toFixed(6)} 0</XForm>\n`;
            xml += `      </Shape>\n`;
        }
        xml += '    </Children>\n';
        xml += '  </Shape>\n';
    }
    else if (type === 'circle' || type === 'ellipse') {
        xml += '  <CutSetting type="Cut">\n';
        xml += '    <index Value="0"/>\n';
        xml += '    <name Value="C00"/>\n';
        xml += '    <maxPower Value="20"/>\n';
        xml += '    <maxPower2 Value="20"/>\n';
        xml += '    <speed Value="100"/>\n';
        xml += '    <priority Value="0"/>\n';
        xml += '  </CutSetting>\n';
        xml += '  <CutSetting type="Offset">\n';
        xml += '    <index Value="1"/>\n';
        xml += '    <name Value="C01"/>\n';
        xml += '    <maxPower Value="20"/>\n';
        xml += '    <maxPower2 Value="20"/>\n';
        xml += '    <speed Value="100"/>\n';
        xml += '    <priority Value="1"/>\n';
        xml += '  </CutSetting>\n';
        xml += '  <Shape Type="Group">\n';
        xml += '    <XForm>1 0 0 1 0 0</XForm>\n';
        xml += '    <Children>\n';
        const numlines = Math.round((width / 2) / spacing);
        for (let linenum = 0; linenum < numlines-1; linenum++) {
            const powerScale = (lowpower + ((highpower - lowpower) * linenum / numlines)).toFixed(2);
            const rx = (width / 2 - spacing * linenum).toFixed(6);
            const ry = (width / 2 - spacing * linenum).toFixed(6);
            xml += `      <Shape Type="Ellipse" CutIndex="0" CutOrder="${linenum}" PowerScale="${powerScale}" Rx="${rx}" Ry="${ry}">\n`;
            xml += `        <XForm>1 0 0 1 ${width / 2} ${width / 2}</XForm>\n`;
            xml += `      </Shape>\n`;
        }
        const rx = (width / 2 - spacing * (numlines - 1)).toFixed(6);
        const ry = (width / 2 - spacing * (numlines - 1)).toFixed(6);
        xml += `      <Shape Type="Ellipse" CutIndex="1" CutOrder="${numlines}" PowerScale="${highpower}" Rx="${rx}" Ry="${ry}">\n`;
        xml += `        <XForm>1 0 0 1 ${width / 2} ${width / 2}</XForm>\n`;
        xml += `      </Shape>\n`;
        xml += '    </Children>\n';
        xml += '  </Shape>\n';
    }

    xml += `</LightBurnProject>\n`;

    document.getElementById('xmlOutput').textContent = xml;
    hljs.highlightElement(document.getElementById('xmlOutput'));

    const downloadBtn = document.getElementById('downloadBtn');
    downloadBtn.disabled = false;
    downloadBtn.onclick = function() {
        const blob = new Blob([xml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '3Dgradient.lbrn2';
        a.click();
        URL.revokeObjectURL(url);
    };
});