async function showSnapshot() {
  const target = document.getElementById('metrics');
  try {
    const response = await fetch('data/summary.json');
    if (!response.ok) throw new Error('Snapshot could not be loaded.');
    const data = await response.json();
    const dollars = new Intl.NumberFormat('en-US', {style:'currency',currency:'USD',maximumFractionDigits:0});
    const values = [['Contracted MRR',dollars.format(data.mrr)],['Annualized ARR',dollars.format(data.arr)],['Active accounts',data.active_accounts],['Users in dataset',data.users]];
    for (const [label,value] of values) {
      const card = document.createElement('div'); card.className='metric';
      const heading = document.createElement('span'); heading.textContent=label;
      const number = document.createElement('strong'); number.textContent=String(value);
      card.append(heading,number); target.append(card);
    }
    const note = document.createElement('p'); note.textContent=`Month-end period: ${data.as_of.slice(0,7)}. Synthetic data; no real company revenue.`; target.after(note);
  } catch (error) {target.textContent='Serve this directory over HTTP to load the snapshot: python -m http.server 8000';}
}
showSnapshot();
