module.exports = {
  /**
   * Parses a time string into seconds from midnight
   * @param {string} timeString  The string in HH:SS format
   * @return {number}  Seconds from midnight
   */
  parseTime(timeString) {
    const [, h, m, s] = /(\d{1,2}):(\d{2}):(\d{2})/g.exec(timeString);
    return Number(h) * 60 ** 2 + Number(m) * 60 + Number(s);
  },

  /**
   * Convert a absolute date to relative seconds from midnight
   * @param {Date} date  The date
   * @return {number}  Seconds from midnight
   */
  getSecondsFromMidnight(date) {
    const midnight = new Date(date);
    midnight.setHours(0, 0, 0, 0);

    return Math.floor((date.getTime() - midnight.getTime()) / 1000);
  },

  /**
   * Formats seconds from midnight into a time string
   * @param {number} seconds  The seconds
   * @return {string}  The time string in HH:SS format
   */
  formatSeconds(seconds) {
    const date = new Date();
    date.setHours(0, 0, seconds);
    const hours = String(date.getHours());
    const mins = String(date.getMinutes());

    return `${hours.padStart(2, '0')}:${mins.padStart(2, '0')}`;
  }
};
