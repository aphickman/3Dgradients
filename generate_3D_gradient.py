import argparse
from lxml import etree

parser = argparse.ArgumentParser(description="A script that generates a gradient")

# Add arguments
parser.add_argument("-T", "--type", type=str, choices=["rect", "ellipse"], default="rect", help="The type of gradient to create (default: rect)")
parser.add_argument("-W", "--width", type=float, default=100.0, help="Width in mm")
parser.add_argument("-H", "--height", type=float, default=100.0, help="Height in mm")
parser.add_argument("-S", "--spacing", type=float, default=0.10, help="Spacing in mm")
parser.add_argument("-P", "--power", type=float, default=100.0 , help="Max power")
parser.add_argument("-L", "--lowpower", type=float, default=0.0 , help="Min power")
parser.add_argument("-O", "--outfile", type=str, default="3Dgradient.lbrn2", help="Output Lightburn file")

# Parse the arguments
args = parser.parse_args()

# Create the root element
root = etree.Element("LightBurnProject", AppVersion="1.7.03", FormatVersion="1", MaterialHeight="0", MirrorX="False", MirrorY="False")

# Create the CutSetting element
cut_setting = etree.SubElement(root, "CutSetting", type="Cut")
etree.SubElement(cut_setting, "index", Value="0")
etree.SubElement(cut_setting, "name", Value="C00")
etree.SubElement(cut_setting, "maxPower", Value="20")
etree.SubElement(cut_setting, "maxPower2", Value="20")
etree.SubElement(cut_setting, "speed", Value="100")
etree.SubElement(cut_setting, "priority", Value="0")

# Create the Shape element
shape_group = etree.SubElement(root, "Shape", Type="Group")
etree.SubElement(shape_group, "XForm").text = "1 0 0 1 0 0"
children = etree.SubElement(shape_group, "Children")

if args.type == "rect":
    # Create the master line
    shape = etree.SubElement(children, "Shape", Type="Path", CutIndex="0", CutOrder="0", PowerScale=str(args.lowpower), VertID="0", PrimID="0")
    etree.SubElement(shape, "XForm").text = "1 0 0 1 0 0"
    etree.SubElement(shape, "VertList").text = f"V0 0V0 {args.height}"
    etree.SubElement(shape, "PrimList").text = "L0 1"

    numlines = round(args.width / args.spacing)
    for linenum in range(1, numlines + 1):
        shape = etree.SubElement(children, "Shape", Type="Path", CutIndex="0", CutOrder=str(linenum), PowerScale=str(args.lowpower + ((args.power - args.lowpower) * linenum / numlines)), VertID="0", PrimID="0")
        etree.SubElement(shape, "XForm").text = f"1 0 0 1 {args.spacing * linenum} 0"
elif args.type == "ellipse":
    # Create the Offset CutSetting element
    offset_cut_setting = etree.SubElement(root, "CutSetting", type="Offset")
    etree.SubElement(offset_cut_setting, "index", Value="1")
    etree.SubElement(offset_cut_setting, "name", Value="C01")
    etree.SubElement(offset_cut_setting, "maxPower", Value="20")
    etree.SubElement(offset_cut_setting, "maxPower2", Value="20")
    etree.SubElement(offset_cut_setting, "speed", Value="100")
    etree.SubElement(offset_cut_setting, "priority", Value="1")

    numlines = round((args.width / 2) / args.spacing)
    for linenum in range(numlines):
        shape = etree.SubElement(children, "Shape", Type="Ellipse", CutIndex="0", CutOrder=str(linenum), PowerScale=str(args.lowpower + ((args.power - args.lowpower) * linenum / numlines)), Rx=str(args.width / 2 - args.spacing * linenum), Ry=str(args.width / 2 - args.spacing * linenum))
        etree.SubElement(shape, "XForm").text = f"1 0 0 1 {args.width / 2} {args.width / 2}"
    shape = etree.SubElement(children, "Shape", Type="Ellipse", CutIndex="1", CutOrder=str(numlines), PowerScale=str(args.power), Rx=str(args.width / 2 - args.spacing * (numlines - 1)), Ry=str(args.width / 2 - args.spacing * (numlines - 1)))
    etree.SubElement(shape, "XForm").text = f"1 0 0 1 {args.width / 2} {args.width / 2}"

# Write the XML to a file
tree = etree.ElementTree(root)
with open(args.outfile, "wb") as f:
    tree.write(f, pretty_print=True, xml_declaration=True, encoding="UTF-8")