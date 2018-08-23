export function checkWarnings(cozyClient) {
  return (
    cozyClient.client.fetchJSON &&
    cozyClient.client
      .fetchJSON('GET', '/settings/warnings')
      .then(() => null)
      .catch(err => {
        if (err.status === 402) {
          try {
            const parsed = JSON.parse(err.message)
            const warnings = parsed.errors

            return warnings
          } catch (err) {
            return null
            // nothing to do
          }
        } else {
          return null
        }
      })
  )
}
