export const parseAndCleanCoordinates = (inputString) => {
    const regex = /RA\s*[:]*\s*(-?\d+(\.\d+)?)[\s,]*/i;
    const regexDec = /DEC\s*[:]*\s*(-?\d+(\.\d+)?)[\s,]*/i;
    const regexAng = /ANG\s*[:]*\s*(-?\d+(\.\d+)?)[\s,]*/i;

    const matchRA = inputString.match(regex);
    const matchDec = inputString.match(regexDec);
    const matchAng = inputString.match(regexAng);
    const ra = matchRA ? parseFloat(matchRA[1]) : null;
    const dec = matchDec ? parseFloat(matchDec[1]) : null;
    const ang = matchAng ? parseFloat(matchAng[1]) : null;
    let text = inputString.replace(regex, '').replace(regexDec, '').replace(regexAng, '').trim();
    text = text.replace(/^[\s,]+|[\s,]+$/g, '');  // Очистка от концевых знаков препинания и пробелов

    return {
        text,
        ra,
        dec,
        ang
    };
};
