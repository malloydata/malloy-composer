For MacOS, Linux:
  Make sure binary is executable:
    
    chmod a+x ./composer

For MacOS
  Remove apple quarantine flag:

    xattr -d com.apple.quarantine ./composer

To launch composer execute the following, then visit localhost:4000 in a web browser

  On MacOS or Linux:
    ./composer malloy-samples

  On Windows
    composer.exe malloy-samples

For more details on options for running the composer binary run add the '--help' option when running composer
