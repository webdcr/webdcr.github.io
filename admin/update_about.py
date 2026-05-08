import re

with open('../about.html', 'r') as f:
    content = f.read()

liquid_code = """
    {% assign director_name = director_name | strip %}
    {% assign idName = director_name | downcase | replace: " ", "" | replace: "0", "" | replace: "1", "" | replace: "2", "" | replace: "3", "" | replace: "4", "" | replace: "5", "" | replace: "6", "" | replace: "7", "" | replace: "8", "" | replace: "9", "" | replace: "’", "" | replace: "'", "" | replace: "-", "" | replace: "–", "" | replace: "—", "" | replace: ",", "" | replace: ".", "" | replace: "!", "" | replace: "?", "" | replace: "(", "" | replace: ")", "" | replace: '"', "" | replace: '“', "" | replace: '”', "" | replace: '&', "" | replace: 'é', "e" | replace: 'á', "a" %}
    
    {% assign photo_source = "/assets/images/showalbums/placeholder.png" %}
    {% for file in site.static_files %}
      {% if file.path contains "/assets/images/directorate/" %}
        {% if file.basename == idName %}
          {% assign photo_source = file.path %}
        {% endif %}
      {% endif %}
    {% endfor %}
    <div class="directoratePerson">
      <div class="directorate-photo">
        <img src="{{ photo_source }}" alt="{{ director_name }}" />
      </div>
"""

# Replace the block
pattern = re.compile(r'    {% assign director_name = director_name \| strip %}.*?<div class="directoratePerson">.*?<div class="directorate-photo">.*?</div>', re.DOTALL)
new_content = pattern.sub(liquid_code.strip(), content)

with open('../about.html', 'w') as f:
    f.write(new_content)
