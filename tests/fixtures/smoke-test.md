# IOC Lens release smoke test

This fixture contains reserved example values only. Do not replace them with
active or incident-derived indicators.

## Expected indicators

- Public IPv4: `192.0.2.10`
- Private IPv4: `10[.]20[.]30[.]40`
- IPv6: `2001:db8::1`
- Domain: `example[.]com`
- MD5: `d41d8cd98f00b204e9800998ecf8427e`
- SHA256: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`

## Values that should not be extracted

- Invalid IPv4: `999.1.1.1`
- Invalid domain suffix: `example.invalid`
- Too-short hash: `abc123`
