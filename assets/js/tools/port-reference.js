// Port reference: a small offline table of the ports that show up most often.
const { tk } = window;

const els = {
  search: document.querySelector('#port-search'),
  proto: document.querySelector('#port-proto'),
  out: document.querySelector('#port-out'),
  status: document.querySelector('#port-status'),
};

const PORTS = [
  [20, 'tcp', 'FTP data', 'File Transfer Protocol data channel'],
  [21, 'tcp', 'FTP control', 'File Transfer Protocol command channel'],
  [22, 'tcp', 'SSH', 'Secure Shell, also used by scp and sftp'],
  [23, 'tcp', 'Telnet', 'Unencrypted remote shell'],
  [25, 'tcp', 'SMTP', 'Mail transfer between servers'],
  [53, 'tcp/udp', 'DNS', 'Name resolution, plus zone transfers over TCP'],
  [67, 'udp', 'DHCP server', 'Address assignment, server side'],
  [68, 'udp', 'DHCP client', 'Address assignment, client side'],
  [69, 'udp', 'TFTP', 'Trivial File Transfer Protocol'],
  [80, 'tcp', 'HTTP', 'Plain web traffic'],
  [88, 'tcp', 'Kerberos', 'Authentication tickets'],
  [110, 'tcp', 'POP3', 'Mailbox retrieval'],
  [111, 'tcp', 'rpcbind', 'Maps RPC program numbers to ports'],
  [119, 'tcp', 'NNTP', 'Usenet news transfer'],
  [123, 'udp', 'NTP', 'Clock synchronisation'],
  [135, 'tcp', 'MS RPC', 'Windows RPC endpoint mapper'],
  [137, 'udp', 'NetBIOS name', 'Windows name service'],
  [138, 'udp', 'NetBIOS datagram', 'Windows datagram service'],
  [139, 'tcp', 'NetBIOS session', 'Windows session service'],
  [143, 'tcp', 'IMAP', 'Mailbox access'],
  [161, 'udp', 'SNMP', 'Device monitoring'],
  [162, 'udp', 'SNMP trap', 'Unsolicited monitoring events'],
  [179, 'tcp', 'BGP', 'Routing between autonomous systems'],
  [194, 'tcp', 'IRC', 'Internet Relay Chat'],
  [389, 'tcp/udp', 'LDAP', 'Directory access'],
  [443, 'tcp', 'HTTPS', 'Web traffic over TLS'],
  [445, 'tcp', 'SMB', 'Windows file sharing'],
  [465, 'tcp', 'SMTPS', 'SMTP over implicit TLS'],
  [500, 'udp', 'ISAKMP', 'IPsec key exchange'],
  [514, 'udp', 'Syslog', 'Central log collection'],
  [515, 'tcp', 'LPD', 'Line printer daemon'],
  [587, 'tcp', 'SMTP submission', 'Client mail submission with STARTTLS'],
  [631, 'tcp/udp', 'IPP', 'Internet Printing Protocol'],
  [636, 'tcp', 'LDAPS', 'Directory access over TLS'],
  [873, 'tcp', 'rsync', 'File synchronisation daemon'],
  [990, 'tcp', 'FTPS', 'FTP over implicit TLS'],
  [993, 'tcp', 'IMAPS', 'IMAP over TLS'],
  [995, 'tcp', 'POP3S', 'POP3 over TLS'],
  [1080, 'tcp', 'SOCKS', 'SOCKS proxy'],
  [1194, 'udp', 'OpenVPN', 'OpenVPN tunnel'],
  [1433, 'tcp', 'MS SQL', 'Microsoft SQL Server'],
  [1521, 'tcp', 'Oracle', 'Oracle database listener'],
  [1701, 'udp', 'L2TP', 'Layer 2 tunnelling'],
  [1723, 'tcp', 'PPTP', 'Point-to-point tunnelling'],
  [1883, 'tcp', 'MQTT', 'Message queue telemetry transport'],
  [2049, 'tcp/udp', 'NFS', 'Network file system'],
  [2181, 'tcp', 'ZooKeeper', 'Distributed coordination'],
  [2375, 'tcp', 'Docker', 'Docker daemon, unencrypted'],
  [2376, 'tcp', 'Docker TLS', 'Docker daemon over TLS'],
  [3000, 'tcp', 'Dev server', 'Common Node and Rails default'],
  [3306, 'tcp', 'MySQL', 'MySQL and MariaDB'],
  [3389, 'tcp', 'RDP', 'Windows Remote Desktop'],
  [4444, 'tcp', 'Metasploit', 'Default Metasploit handler port'],
  [5000, 'tcp', 'Dev server', 'Common Flask and .NET default'],
  [5432, 'tcp', 'PostgreSQL', 'PostgreSQL database'],
  [5601, 'tcp', 'Kibana', 'Kibana web interface'],
  [5672, 'tcp', 'AMQP', 'RabbitMQ and other brokers'],
  [5900, 'tcp', 'VNC', 'Virtual Network Computing'],
  [5984, 'tcp', 'CouchDB', 'CouchDB HTTP API'],
  [6379, 'tcp', 'Redis', 'Redis key-value store'],
  [6443, 'tcp', 'Kubernetes API', 'kube-apiserver'],
  [7001, 'tcp', 'WebLogic', 'Oracle WebLogic admin'],
  [8000, 'tcp', 'Dev server', 'Common Django and generic HTTP default'],
  [8080, 'tcp', 'HTTP alt', 'Alternative HTTP, proxies and app servers'],
  [8081, 'tcp', 'HTTP alt', 'Second alternative HTTP port'],
  [8443, 'tcp', 'HTTPS alt', 'Alternative HTTPS port'],
  [8888, 'tcp', 'Jupyter', 'Jupyter Notebook server'],
  [9000, 'tcp', 'PHP-FPM', 'PHP FastCGI process manager'],
  [9090, 'tcp', 'Prometheus', 'Prometheus web interface'],
  [9092, 'tcp', 'Kafka', 'Kafka broker'],
  [9200, 'tcp', 'Elasticsearch', 'Elasticsearch REST API'],
  [9300, 'tcp', 'Elasticsearch', 'Elasticsearch node transport'],
  [11211, 'tcp/udp', 'Memcached', 'In-memory cache'],
  [27017, 'tcp', 'MongoDB', 'MongoDB database'],
  [27018, 'tcp', 'MongoDB shard', 'MongoDB shard server'],
];

function render() {
  const query = els.search.value.trim().toLowerCase();
  const proto = els.proto.value;
  const matches = PORTS.filter(([port, protocols, service, desc]) => {
    if (proto !== 'all' && !protocols.split('/').includes(proto)) return false;
    if (!query) return true;
    return String(port).includes(query) || service.toLowerCase().includes(query) || desc.toLowerCase().includes(query);
  });

  const table = document.createElement('table');
  table.className = 'tool-table';
  table.innerHTML = '<thead><tr><th>Port</th><th>Protocol</th><th>Service</th><th>Notes</th></tr></thead>';
  const body = document.createElement('tbody');
  matches.forEach(([port, protocols, service, desc]) => {
    const tr = document.createElement('tr');
    [String(port), protocols, service, desc].forEach((value, index) => {
      const cell = document.createElement(index === 0 ? 'th' : 'td');
      if (index === 0) cell.scope = 'row';
      cell.textContent = value;
      tr.appendChild(cell);
    });
    body.appendChild(tr);
  });
  table.appendChild(body);
  els.out.replaceChildren(table);
  tk.setStatus(els.status, `${matches.length} of ${PORTS.length} ports shown.`, matches.length ? 'ok' : '');
}

tk.live([els.search, els.proto], render);
