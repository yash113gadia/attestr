import exifr from 'exifr';

export async function extractExif(file) {
  try {
    const data = await exifr.parse(file, {
      tiff: true,
      exif: true,
      gps: true,
      icc: false,
      iptc: true,
      xmp: true,
    });

    if (!data) return null;

    // Organize into categories
    const organized = {
      camera: {},
      datetime: {},
      location: {},
      image: {},
      software: {},
    };

    if (data.Make) organized.camera.Make = data.Make;
    if (data.Model) organized.camera.Model = data.Model;
    if (data.LensModel) organized.camera.Lens = data.LensModel;
    if (data.FocalLength) organized.camera['Focal Length'] = `${data.FocalLength}mm`;
    if (data.FNumber) organized.camera['Aperture'] = `f/${data.FNumber}`;
    if (data.ISO || data.ISOSpeedRatings) organized.camera.ISO = data.ISO || data.ISOSpeedRatings;
    if (data.ExposureTime) organized.camera['Shutter Speed'] = `1/${Math.round(1 / data.ExposureTime)}s`;

    if (data.DateTimeOriginal) organized.datetime['Date Taken'] = formatDate(data.DateTimeOriginal);
    if (data.ModifyDate) organized.datetime['Date Modified'] = formatDate(data.ModifyDate);
    if (data.CreateDate) organized.datetime['Date Created'] = formatDate(data.CreateDate);

    if (data.latitude !== undefined) organized.location.Latitude = data.latitude.toFixed(6);
    if (data.longitude !== undefined) organized.location.Longitude = data.longitude.toFixed(6);
    if (data.GPSAltitude) organized.location.Altitude = `${data.GPSAltitude.toFixed(1)}m`;

    if (data.ImageWidth) organized.image.Width = `${data.ImageWidth}px`;
    if (data.ImageHeight) organized.image.Height = `${data.ImageHeight}px`;
    if (data.ColorSpace) organized.image['Color Space'] = data.ColorSpace === 1 ? 'sRGB' : data.ColorSpace;
    if (data.Orientation) organized.image.Orientation = data.Orientation;

    if (data.Software) organized.software.Software = data.Software;
    if (data.ProcessingSoftware) organized.software['Processing Software'] = data.ProcessingSoftware;

    // Flag suspicious fields
    const flags = [];
    if (data.Software) {
      flags.push({ field: 'Software', value: data.Software, reason: 'Editing software detected — file may have been processed' });
    }
    if (data.ModifyDate && data.DateTimeOriginal && data.ModifyDate.getTime() !== data.DateTimeOriginal.getTime()) {
      flags.push({ field: 'Date Mismatch', value: `Original: ${formatDate(data.DateTimeOriginal)}, Modified: ${formatDate(data.ModifyDate)}`, reason: 'Modify date differs from original capture date' });
    }

    return { organized, flags, raw: data };
  } catch {
    return null;
  }
}

function formatDate(date) {
  if (date instanceof Date) {
    return date.toLocaleString();
  }
  return String(date);
}
