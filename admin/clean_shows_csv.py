import csv

with open('../_data/shows.csv', 'r', newline='') as f:
    reader = csv.reader(f)
    headers = next(reader)
    if 'Image name' in headers:
        img_idx = headers.index('Image name')
        rows = [headers[:img_idx] + headers[img_idx+1:]]
        for row in reader:
            if len(row) > img_idx:
                rows.append(row[:img_idx] + row[img_idx+1:])
            else:
                rows.append(row)
        
        with open('../_data/shows.csv', 'w', newline='') as fw:
            writer = csv.writer(fw)
            writer.writerows(rows)
