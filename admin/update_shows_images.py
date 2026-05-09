import re

with open('../_includes/header.html', 'r') as f:
    content = f.read()

# Insert window.WEBDCR_SHOW_IMAGES definition right before window.WEBDCR_SHOWS
images_script = """
  window.WEBDCR_SHOW_IMAGES = {};
  {% for file in site.static_files %}
    {% if file.path contains "/assets/images/showalbums/" %}
      window.WEBDCR_SHOW_IMAGES["{{ file.basename }}"] = "{{ file.path }}";
    {% endif %}
  {% endfor %}
"""
content = re.sub(r'(window\.WEBDCR_SHOWS = window\.WEBDCR_SHOWS)', images_script + r'\n  \1', content)

# Replace sanitizeImagePath in header.html
new_sanitize = """
    function getShowImagePath(showName) {
      if (!showName) return "/assets/images/showalbums/placeholder.png";
      const idName = showName.toLowerCase().replace(/[^a-z]/g, '');
      if (window.WEBDCR_SHOW_IMAGES && window.WEBDCR_SHOW_IMAGES[idName]) {
        return window.WEBDCR_SHOW_IMAGES[idName];
      }
      return "/assets/images/showalbums/placeholder.png";
    }
"""
content = re.sub(r'    function sanitizeImagePath\(name\) \{.*?\n    \}', new_sanitize.strip('\n'), content, flags=re.DOTALL)

# Replace the usage of sanitizeImagePath
content = content.replace('const art = sanitizeImagePath(matchingShow && matchingShow["Image name"]);', 'const art = getShowImagePath(matchingShow && matchingShow["Name"]);')

with open('../_includes/header.html', 'w') as f:
    f.write(content)

with open('../index.html', 'r') as f:
    content = f.read()

# Replace sanitizeImagePath in index.html
new_sanitize_index = """
      getShowImagePath(showName) {
        if (!showName) return "/assets/images/showalbums/placeholder.png";
        const idName = showName.toLowerCase().replace(/[^a-z]/g, '');
        if (window.WEBDCR_SHOW_IMAGES && window.WEBDCR_SHOW_IMAGES[idName]) {
          return window.WEBDCR_SHOW_IMAGES[idName];
        }
        return "/assets/images/showalbums/placeholder.png";
      },
"""
content = re.sub(r'      sanitizeImagePath\(name\) \{.*?\n      \},', new_sanitize_index.strip('\n') + ',', content, flags=re.DOTALL)

# Replace the usage of sanitizeImagePath
content = content.replace("imageSrc: this.sanitizeImagePath(show['Image name']),", "imageSrc: this.getShowImagePath(show['Name']),")

with open('../index.html', 'w') as f:
    f.write(content)
