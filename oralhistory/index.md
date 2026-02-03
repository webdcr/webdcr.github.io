---
layout: oralhistory_clean
title: "Oral history"
permalink: /oralhistory
---

{% assign oh_title = site.oralhistory_title | default: 'Broadcasting at Dartmouth Oral History Project' %}
<section class="oralhistory-intro">
  <h1 class="oralhistory-hero-title">Oral history</h1>
  <p class="oralhistory-summary">
    Interviews, audio, and transcripts capturing the voices behind WDCR and WFRD.
    This archive grows term by term with help from student producers and alumni contributors.
  </p>
  <p>
    Want to participate or share materials? Email
    <a href="mailto:webdcr@dartmouth.edu">webdcr@dartmouth.edu</a>.
  </p>
</section>

<section class="oralhistory-listing">
  <h2>Interviews</h2>
  {% assign vocab = site.data.vocab | default: {} %}
  {% assign interviews_sorted = site.interviews | sort: 'date' | reverse %}
  {% assign empty_array = '' | split: '' %}
  {% if interviews_sorted and interviews_sorted.size > 0 %}
  <ul>
    {% for iv in interviews_sorted %}
    {% assign participants = iv.people.participants | default: empty_array %}
    {% capture person_line %}
      {% if participants.size > 0 %}
        {% for slug in participants %}
          {% assign meta = site.data.people[slug] %}
          {{ meta.name | default: slug }}{% if meta.class_year %} '{{ meta.class_year | slice: -2, 2 }}{% endif %}{% unless forloop.last %}, {% endunless %}
        {% endfor %}
      {% else %}
        Unspecified participant
      {% endif %}
    {% endcapture %}
    <li class="oralhistory-listing-item">
      <div class="oralhistory-listing-person">
        <a class="oralhistory-person-label" href="{{ iv.url | relative_url }}">{{ person_line | strip }}</a>
      </div>
      <div class="oralhistory-listing-details">
        {% if iv.date %}
        <span class="oralhistory-listing-date">Interviewed {{ iv.date | date: '%b %-d, %Y' }}</span>
        {% endif %}
        {% if iv.tags %}
        <div class="oralhistory-tag-list">
          {% for tag in iv.tags %}
          {% assign tag_meta = vocab[tag] %}
          <a class="oralhistory-tag-link" href="{{ site.oralhistory_baseurl | default: '/oralhistory' }}/tags/{{ tag }}/">
            {{ tag_meta.label | default: tag }}
          </a>
          {% endfor %}
        </div>
        {% endif %}
      </div>
    </li>
    {% endfor %}
  </ul>
  {% else %}
  <p>No interviews have been published yet.</p>
  {% endif %}
</section>
