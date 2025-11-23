// script.js
// Loads the SVG, finds segment layers, and wires hover/click behavior.
// Expects the file "01-Feeling-Wheel-segmented.svg" next to index.html.

const SVG_FILE = '01-Feeling-Wheel-segmented.svg';
const container = document.getElementById('svgContainer');
const infoContent = document.getElementById('infoContent');
const placeholder = document.querySelector('.placeholder');
const emotionTitle = document.getElementById('emotionTitle');
const subFeelingsList = document.getElementById('subFeelings');
const segmentIdEl = document.getElementById('segmentId');

let selectedElement = null;
let segmentsByGroup = {}; // { groupName: [ {id, el, subLabel} ] }

function capitalize(s){
  if(!s) return s;
  return s[0].toUpperCase() + s.slice(1);
}

function normalizeId(id){
  // tidy up id (remove trailing/leading whitespace)
  return (id || '').trim();
}

// Determine if an element qualifies as a "segment".
// We'll accept shapes (path, polygon, circle, ellipse, rect) or group elements that contain shapes.
// And the element must have an id attribute.
function isSegmentElement(el){
  if(!el) return false;
  if(!el.id) return false;
  const tag = el.tagName.toLowerCase();
  if(['path','polygon','circle','ellipse','rect','polyline'].includes(tag)) return true;
  if(tag === 'g'){
    // if group contains one or more shape children, consider it a segment
    return !!el.querySelector('path, polygon, circle, ellipse, rect, polyline');
  }
  return false;
}

function parseLayerId(id){
  // The example IDs you provided look like: fear-1-nervous, fear-2-scared, ...
  // We'll split on '-' and treat the first token as the basic emotion (group),
  // the trailing tokens (after the numeric index) as the sub-feeling label.
  // Fallback: if id doesn't follow that pattern, use the full id as subLabel and group "Unknown".
  const parts = id.split('-').map(p => p.trim()).filter(Boolean);
  if(parts.length >= 3 && /^\d+$/.test(parts[1])){
    const group = parts[0].toLowerCase();
    const subLabel = parts.slice(2).join('-');
    return { group, subLabel };
  }
  // fallback: if there is a trailing number, remove it
  if(parts.length >= 2 && /^\d+$/.test(parts[parts.length-1])){
    const group = parts.slice(0, -1).join('-').toLowerCase();
    return { group, subLabel: parts[parts.length-1] };
  }
  // fallback: treat first token as group
  if(parts.length >= 2){
    return { group: parts[0].toLowerCase(), subLabel: parts.slice(1).join('-') };
  }
  return { group: 'unknown', subLabel: id };
}

function clearSelection(){
  if(selectedElement){
    selectedElement.classList.remove('segment-selected');
    selectedElement = null;
  }
}

function selectElement(el){
  clearSelection();
  selectedElement = el;
  if(selectedElement){
    selectedElement.classList.add('segment-selected');
  }
}

function updateInfoPanelForSegment(segmentInfo){
  // segmentInfo: { id, el, group, subLabel }
  const groupName = capitalize(segmentInfo.group);
  const entries = segmentsByGroup[segmentInfo.group] || [];
  // populate title and list
  emotionTitle.textContent = groupName;
  // list sub-feelings (unique)
  const uniqueSubs = Array.from(new Set(entries.map(e => e.subLabel))).filter(Boolean);
  subFeelingsList.innerHTML = '';
  if(uniqueSubs.length){
    uniqueSubs.forEach(s => {
      const li = document.createElement('li');
      li.textContent = capitalize(s.replace(/[-_]/g, ' '));
      subFeelingsList.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = capitalize(segmentInfo.subLabel || 'Unknown');
    subFeelingsList.appendChild(li);
  }

  segmentIdEl.textContent = `layer id: ${segmentInfo.id}`;
  placeholder.style.display = 'none';
  infoContent.hidden = false;
}

function wireSegmentEvents(segmentInfo){
  const el = segmentInfo.el;
  // mouse enter
  el.addEventListener('mouseenter', () => {
    // add hover class
    el.classList.add('segment-hover');
  });
  el.addEventListener('mouseleave', () => {
    el.classList.remove('segment-hover');
  });
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    selectElement(el);
    updateInfoPanelForSegment(segmentInfo);
  });
  // also keyboard accessible
  el.setAttribute('tabindex', '0');
  el.addEventListener('keydown', (ev) => {
    if(ev.key === 'Enter' || ev.key === ' '){
      ev.preventDefault();
      el.click();
    }
  });
}

function attachOutsideClickDeselect(){
  // click outside deselects
  document.addEventListener('click', (e) => {
    // if click target is inside the svg container, keep selection
    if(container.contains(e.target)) return;
    // otherwise clear
    clearSelection();
    placeholder.style.display = '';
    infoContent.hidden = true;
  });
}

async function loadSVG(){
  try{
    const resp = await fetch(SVG_FILE);
    if(!resp.ok) throw new Error(`Failed to fetch ${SVG_FILE}: ${resp.status}`);
    const text = await resp.text();
    // insert into container
    container.innerHTML = text;
    // find svg element
    const svgEl = container.querySelector('svg');
    if(!svgEl){
      console.warn('No <svg> element found in SVG file.');
      return;
    }
    // ensure pointer events on shapes
    svgEl.style.pointerEvents = 'visiblePainted';

    // find candidate segment elements
    const allCandidates = Array.from(svgEl.querySelectorAll('*')).filter(isSegmentElement);

    // Filter by id presence
    const withIds = allCandidates.filter(el => el.id && el.id.trim().length > 0);

    // Build segments list
    const segments = withIds.map(el => {
      const id = normalizeId(el.id);
      const parsed = parseLayerId(id);
      return {
        id,
        el,
        group: parsed.group,
        subLabel: parsed.subLabel
      };
    });

    // If the SVG exported layers with spaces in IDs, they may appear different.
    // We'll still proceed with any discovered segments.
    if(segments.length === 0){
      console.warn('No segment layers with ids detected. Ensure each layer has an id.');
    }

    // group by group name
    segmentsByGroup = {};
    segments.forEach(s => {
      if(!segmentsByGroup[s.group]) segmentsByGroup[s.group] = [];
      segmentsByGroup[s.group].push(s);
    });

    // Wire events
    segments.forEach(s => {
      // Ensure the element is visible for pointer events
      s.el.style.cursor = 'pointer';
      wireSegmentEvents(s);
    });

    attachOutsideClickDeselect();

    // If you expect 32 segments, attempt to highlight a diagnostic if not matched
    if(segments.length !== 32){
      console.info(`Detected ${segments.length} segment-like elements (expected 32). If this is unexpected, check layer ids and element shapes in the SVG.`);
    } else {
      console.info('Detected 32 segment elements.');
    }

  } catch(err){
    console.error('Error loading SVG:', err);
    container.innerHTML = `<p style="color:#900">Failed to load SVG: ${err.message}</p>`;
  }
}

// start
loadSVG();