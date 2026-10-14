#!/usr/bin/env python3
"""Import an explicitly downloaded DJP HTML snapshot; never runs during a build.

Usage: python3 scripts/tax/import-djp-objects.py snapshot.html --date YYYY-MM-DD
Only names/codes are imported. HTML data-tarif values are deliberately discarded:
a current selector does not establish either historical validity or tax liability.
"""
import argparse
import hashlib
import json
from html.parser import HTMLParser
from pathlib import Path
from datetime import date

GROUPS = {
    'kdJnsPjkBln': 'pph21', 'kdJnsPjkFinal': 'pph21',
    'kdJnsPjkTidakFinal': 'pph21', 'kdJnsPjk22': 'pph22',
    'kdJnsPjk23': 'pph23', 'kdJnsPjk42': 'final', 'kdJnsPjk15': 'pph15',
}
NAMES = {
    'pph21': [
        'Permanent employee', 'Periodic pension recipient',
        'Severance paid as a lump sum', 'Pension or old-age benefits paid as a lump sum',
        'State-funded honoraria for public officials, civil servants, military or police personnel and pensioners',
        'Non-permanent employee', 'Multi-level marketing distributor', 'Insurance agent',
        'Travelling merchandise seller', 'Independent professional', 'Artist', 'Other non-employee',
        'Irregular remuneration for commissioners or supervisory board members',
        'Bonuses and similar remuneration for former employees', 'Pension fund withdrawal by an employee', 'Activity participant',
    ],
    'pph22': [
        'Imports subject to the 10% reference rate', 'Imports subject to the 7.5% reference rate',
        'Imports subject to the 0.5% reference rate', 'Imports by an API licence holder', 'Imports without an API licence',
        'Purchases by state-owned or designated enterprises', 'Cement sales to distributors',
        'Steel sales to distributors', 'Automotive sales to distributors', 'Pharmaceutical sales to distributors',
        'Paper sales to distributors', 'Domestic vehicle sales by manufacturers or importers',
        'Coal, metallic mineral or non-metallic mineral purchases from mining permit holders', 'Gold bullion sales',
        'Unprocessed forestry product purchases', 'Unprocessed plantation product purchases',
        'Unprocessed agricultural product purchases', 'Unprocessed livestock product purchases', 'Unprocessed fishery product purchases',
        'Pertamina fuel sales to non-distributors (non-final)', 'Other producers’ fuel sales to non-distributors (non-final)',
        'Lubricant sales by importers or producers', 'Airtime and starter-pack sales by second-tier distributors',
        'Gas fuel sales to non-distributors (non-final)', 'Income from transactions through procurement information systems',
        'Pertamina fuel sales to distributors (final)', 'Other producers’ fuel sales to distributors (final)',
        'Gas fuel sales to distributors (final)', 'Sales of specified luxury aircraft, vessels or vehicles',
        'Sales of specified luxury houses or apartments', 'Coal and mineral exports, subject to contractual exceptions',
        'Crypto income collected by non-physical-asset trading platforms', 'Self-paid tax on crypto income',
        'Purchases by state-owned or designated enterprises (reference code)',
        'Imports: reference-listed 23-100-01 code', 'Imports: reference-listed 23-100-02 code',
        'Imports: reference-listed 23-100-03 code', 'Imports: reference-listed 23-100-04 code', 'Imports: reference-listed 23-100-05 code',
    ],
    'pph23': [
        'Prizes, awards and bonuses not subject to Article 21', 'Rental of assets other than land or buildings',
        'Dividends', 'Interest not subject to final Article 4(2) tax', 'Royalties',
        'Technical services', 'Management services', 'Consultancy services', 'Appraisal services', 'Actuarial services',
        'Accounting, bookkeeping and attestation', 'Legal services', 'Architectural services', 'Urban planning and landscape architecture',
        'Design services', 'Oil and gas drilling, other than by a permanent establishment',
        'Oil, gas and geothermal support services', 'Oil, gas and geothermal mining and support services',
        'Aviation and airport support services', 'Forestry harvesting', 'Waste processing', 'Labour supply and outsourcing',
        'Intermediary and agency services', 'Securities trading services, subject to exclusions', 'Custodial services, subject to exclusions',
        'Voice recording and dubbing', 'Film mixing', 'Production of advertising and promotional materials',
        'Computer software, hardware and maintenance', 'Website development and management', 'Internet and connectivity services',
        'Data, information and software storage, processing and transmission', 'Installation services outside the licensed construction scope',
        'Maintenance services outside the licensed construction scope', 'Vehicle maintenance and repair', 'Contract manufacturing',
        'Investigation and security', 'Event organisation', 'Advertising and media placement', 'Pest control', 'Cleaning services',
        'Septic tank pumping', 'Swimming pool maintenance', 'Catering', 'Freight forwarding', 'Logistics', 'Document handling',
        'Packaging', 'Loading and unloading', 'Laboratory and testing services, subject to exclusions', 'Parking management',
        'Soil probing', 'Land preparation and processing', 'Nurseries and planting', 'Plant maintenance', 'Harvesting',
        'Processing agricultural, plantation, forestry, fishery and livestock products', 'Decoration', 'Printing and publishing',
        'Translation', 'Transport and forwarding outside Article 15', 'Port services', 'Pipeline transport', 'Childcare',
        'Training and courses', 'ATM cash delivery and replenishment', 'Certification', 'Surveys', 'Testing',
        'Other services paid from state or regional budgets', 'Token distribution payment transaction services',
        'Voucher marketing', 'Voucher distribution payment transaction services', 'Voucher customer loyalty programmes',
    ],
    'final': [
        'Bond interest received by resident taxpayers or permanent establishments (reference variant 01)',
        'Bond interest received by non-resident taxpayers',
        'Bond interest received by resident taxpayers or permanent establishments (reference variant 03)',
        'Treasury bill discounts received by resident taxpayers or permanent establishments',
        'Treasury bill discounts received by non-resident taxpayers',
        'Bond interest received by resident taxpayers or permanent establishments (reference variant 06)',
        'Bond and government security interest or discounts (reference placeholder)',
        'Transfer of land or building rights', 'Transfer of qualifying simple houses or apartments by property businesses',
        'Land or building transfers for qualifying public-interest acquisitions',
        'Land or building rental (reference variant 01)', 'Land or building rental (reference variant 02)',
        'Domestic savings interest and discounts not funded from export proceeds',
        'IDR export-proceeds deposit interest: one-month term', 'IDR export-proceeds deposit interest: three-month term',
        'IDR export-proceeds deposit interest: at least six months', 'USD export-proceeds deposit interest: one-month term',
        'USD export-proceeds deposit interest: three-month term', 'USD export-proceeds deposit interest: six-month term',
        'USD export-proceeds deposit interest: over six months', 'Overseas deposit interest through specified banks',
        'Bank Indonesia certificate discounts', 'Current account interest', 'Deposit or savings interest, SBI discounts and current account interest (reference placeholder)',
        'Lottery prizes received by resident taxpayers', 'Lottery prizes received by non-resident taxpayers',
        'Exchange-traded share sales other than founder shares', 'Exchange-traded founder share sales',
        'Unlisted share sales by venture capital companies',
        'Construction: small-business or individual competency certificate (self-paid)',
        'Construction: no business or competency certificate (self-paid)', 'Construction: other certified providers (self-paid)',
        'Integrated construction: certified provider (self-paid)', 'Integrated construction: uncertified provider (self-paid)',
        'Construction consultancy: certified provider (self-paid)', 'Construction consultancy: uncertified provider (self-paid)',
        'Construction: small-business or individual competency certificate', 'Construction: no business or competency certificate',
        'Construction: other certified providers', 'Integrated construction: certified provider', 'Integrated construction: uncertified provider',
        'Construction consultancy: certified provider', 'Construction consultancy: uncertified provider',
        'Cooperative savings interest up to IDR 240,000', 'Cooperative savings interest above IDR 240,000',
        'Dividends received by resident individuals', 'Upstream oil and gas uplift',
        'Exploration participating interest (reference variant 02)', 'Exploitation participating interest (reference variant 03)',
        'Exploration participating interest (reference variant 04)', 'Exploitation participating interest (reference variant 05)',
        'Qualifying small-business turnover under PP 23/2018 or PP 55/2022',
        'Purchases from qualifying small-turnover taxpayers under PP 55/2022',
        'Qualifying individual business turnover up to IDR 500 million', 'Qualifying small businesses in IKN: 0% facility',
        'Purchases benefiting from the IKN small-business 0% facility', 'Income from cooperation with the Indonesia Investment Authority',
    ],
    'pph15': [
        'Domestic shipping transport or charter income', 'Payments to domestic shipping companies',
        'Foreign shipping or aviation transport outside charter agreements', 'Vessel or aircraft charter through a permanent establishment',
        'Foreign taxpayer with an Indonesian trade representative office', 'International toy contract manufacturing', 'Domestic aircraft charter',
    ],
}


def codes(prefix, start, end):
    return [f'{prefix}-{i:02d}' for i in range(start, end + 1)]


EXPECTED_CODES = {
    'pph21': ['21-100-01', '21-100-02', '21-401-01', '21-401-02', '21-402-01'] + codes('21-100', 3, 13),
    'pph22': codes('22-100', 1, 24) + ['22-101-01'] + codes('22-401', 1, 3)
        + ['22-403-01', '22-403-02', '22-404-01', '22-405-02', '22-405-03', '22-900-01'] + codes('23-100', 1, 5),
    'pph23': ['24-100-01', '24-100-02', '24-101-01', '24-102-01', '24-103-01'] + codes('24-104', 1, 69),
    'final': codes('28-401', 1, 6) + ['28-401-XX'] + codes('28-402', 1, 3) + codes('28-403', 1, 2)
        + codes('28-404', 1, 11) + ['28-404-XX', '28-405-01', '28-405-02', '28-406-01', '28-407-01', '28-408-01']
        + codes('28-409', 15, 28) + ['28-417-01', '28-417-02', '28-419-01'] + codes('28-421', 1, 5)
        + ['28-423-01', '28-423-02', '28-423-03', '28-423-12', '28-423-13', '28-499-02'],
    'pph15': ['28-410-01', '28-410-02', '28-411-01', '28-411-02', '28-413-01', '28-499-01', '29-101-01'],
}


class SelectorParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.selector = ''
        self.option = None
        self.rows = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'select':
            self.selector = attrs.get('id', '')
        if tag == 'option' and self.selector in GROUPS and attrs.get('value'):
            self.option = {'group': GROUPS[self.selector], 'code': attrs['value'], 'officialName': ''}

    def handle_data(self, data):
        if self.option is not None:
            self.option['officialName'] += data

    def handle_endtag(self, tag):
        if tag == 'option' and self.option is not None:
            row = self.option
            row['officialName'] = ' '.join(row['officialName'].split())
            row['officialName'] = row['officialName'].removeprefix(row['code']).lstrip(' -')
            self.rows.append(row)
            self.option = None
        if tag == 'select':
            self.selector = ''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('html', type=Path)
    parser.add_argument('--date', required=True, type=date.fromisoformat)
    args = parser.parse_args()
    raw = args.html.read_bytes()
    html = SelectorParser()
    html.feed(raw.decode('utf-8'))
    for group, names in NAMES.items():
        rows = [row for row in html.rows if row['group'] == group]
        if len(rows) != len(names):
            raise SystemExit(f'{group}: selector changed ({len(rows)} rows, {len(names)} translations); review manually')
        expected = EXPECTED_CODES[group]
        if len(expected) != len(names) or {row['code'] for row in rows} != set(expected):
            raise SystemExit(f'{group}: reference codes changed; review translations before importing')
        translations = dict(zip(expected, names))
        for row in rows:
            row['name'] = translations[row['code']]
    keys = [(row['group'], row['code']) for row in html.rows]
    if len(keys) != len(set(keys)):
        raise SystemExit('Duplicate codes within a tax category; review the snapshot')
    snapshot = {
        'source': 'https://kalkulator.pajak.go.id/',
        'retrieved': args.date.isoformat(),
        'sha256': hashlib.sha256(raw).hexdigest(),
        'scope': 'All 193 object options in the downloaded reference HTML; not a complete national or historical code registry.',
        'objects': html.rows,
    }
    root = Path(__file__).resolve().parents[2]
    target = root / 'assets/js/data/indonesian-tax-objects.js'
    target.write_text('// Generated by scripts/tax/import-djp-objects.py. No rates or validity dates are inferred.\nexport default '
                      + json.dumps(snapshot, ensure_ascii=False, indent=2) + ';\n')
    print(f'Imported {len(html.rows)} reference objects into {target.relative_to(root)}')


if __name__ == '__main__':
    main()
