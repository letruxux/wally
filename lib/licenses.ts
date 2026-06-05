export function getLicenseUrl(name: string) {
  switch (name) {
    case "MIT":
      return "https://choosealicense.com/licenses/mit/";
    case "Apache-2.0":
      return "https://choosealicense.com/licenses/apache-2.0/";
    case "BSD-3-Clause":
      return "https://choosealicense.com/licenses/bsd-3-clause/";
    case "BSD-2-Clause":
      return "https://choosealicense.com/licenses/bsd-2-clause/";
    case "BSD-1-Clause":
      return "https://opensource.org/licenses/BSD-1-Clause";
    case "ISC":
      return "https://choosealicense.com/licenses/isc/";
    case "CC0-1.0":
      return "https://choosealicense.com/licenses/cc0-1.0/";
    case "Unlicense":
      return "https://choosealicense.com/licenses/unlicense/";
    case "WTFPL":
      return "https://choosealicense.com/licenses/wtfpl/";
    case "MPL-2.0":
      return "https://choosealicense.com/licenses/mpl-2.0/";
    case "GPL-3.0":
      return "https://choosealicense.com/licenses/gpl-3.0/";
    case "GPL-2.0":
      return "https://choosealicense.com/licenses/gpl-2.0/";
    default:
      return "https://choosealicense.com/appendix/";
  }
}
