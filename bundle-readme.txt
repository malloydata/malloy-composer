For MacOS, Linux:
  Make sure binary is executable:
    
    chmod a+x ./composer

For MacOS
  Remove apple quarantine flag:

    xattr -d com.apple.quarantine ./composer

To launch composer execute the following, then visit localhost:4000 in a web browser

    ./composer malloy-samples