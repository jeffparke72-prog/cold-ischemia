import pymupdf
c=pymupdf.open('/tmp/_cover.pdf');b=pymupdf.open('/tmp/_body.pdf')
o=pymupdf.open();o.insert_pdf(c,from_page=0,to_page=0);o.insert_pdf(b)
o.set_metadata({'title':'Not a Spare: The Living Donor\u2019s Field Guide','author':'Cold Ischemia Foundation','subject':'Living organ donation in the United States'})
o.save('not-a-spare-living-donor-guide.pdf',garbage=4,deflate=True);print(len(o),'pages')
