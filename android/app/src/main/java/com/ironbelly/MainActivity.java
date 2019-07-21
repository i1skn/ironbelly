package com.ironbelly;

import android.content.ContentResolver;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.provider.MediaStore;
import android.util.Log;
import com.facebook.react.ReactActivity;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "Ironbelly";
  }

  @Override
  protected void onResume() {
    super.onResume();
    Uri data = getIntent().getData();
    if (data != null) {
      try {
        importData(data);
      } catch (Exception e) {
        Log.e("File Import Error", e.getMessage());
      }
    }
  }

  private void importData(Uri data) {
    final String scheme = data.getScheme();

    if (ContentResolver.SCHEME_CONTENT.equals(scheme)) {
      try {
        ContentResolver cr = getApplicationContext().getContentResolver();
        InputStream is = cr.openInputStream(data);
        if (is == null) return;

        String name = getContentName(cr, data);

        PackageManager m = getPackageManager();
        String s = getPackageName();
        PackageInfo p = m.getPackageInfo(s, 0);
        s = p.applicationInfo.dataDir;

        InputStreamToFile(is, s + "/files/" + name);
      } catch (Exception e) {
        Log.e("File Import Error", e.getMessage());
      }
    }
  }

  private String getContentName(ContentResolver resolver, Uri uri) {
    Cursor cursor = resolver.query(uri, null, null, null, null);
    cursor.moveToFirst();
    int nameIndex = cursor.getColumnIndex(MediaStore.MediaColumns.DISPLAY_NAME);
    if (nameIndex >= 0) {
      return cursor.getString(nameIndex);
    } else {
      return null;
    }
  }

  private void InputStreamToFile(InputStream in, String file) {
    try {
      OutputStream out = new FileOutputStream(new File(file));

      int size = 0;
      byte[] buffer = new byte[1024];

      while ((size = in.read(buffer)) != -1) {
        out.write(buffer, 0, size);
      }

      out.close();
    } catch (Exception e) {
      Log.e("MainActivity", "InputStreamToFile exception: " + e.getMessage());
    }
  }
}
