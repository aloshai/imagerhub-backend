## Imagerhub
ImagerHub is an app that lets you upload images, create collections, and make collages like Pinterest. It is an application that will analyze the photos you upload and give tags to these images, allowing them to be in your exploration of the pictures you love to see.

## To-Do List
  - [x] File Microservice for possible problems
  - [x] File upload and compression (without losing quality)
  - [x] CDN to view image (currently being sent by the server, S3 support may be added in the future)
  - [ ] Taking a backup (using gzip)
    - For the backups to be efficient, the file created with gzip gets hashed and if it has a state that matches the previous backups, a new backup will not be created
  - [ ] User
    - [ ] Authorization
    - [ ] User Collages
    - [ ] Followers
    - [ ] Usually preferred tags
  - [ ] Image
    - [ ] Collages
    - [ ] Collection
    - [ ] Liking
    - [ ] Tagging with AI
    - [ ] Multi-format support (now only converts to .jpg there is no supporting .gif, png, mjpeg, etc.)
  - [ ] AI (ready dataset will be used)
    - [ ] Image analysis
    - [ ] Research (https://github.com/aloshai/imagerhub-backend/issues/1)
    - [ ] Integration (https://github.com/aloshai/imagerhub-backend/issues/2)
  
## Benchmark
Environment: i5-6402P (4 CPUs), GTX 950, 16GB DDR4 RAM

### Tests
- [x] Image Compress Tests
  - 15.5MB (.png) file -> 677kb (.jpg) file (delay is not calculated)
  - 4.5MB (.png) file -> 320kb (.jpg) file (delay is not calculated)
  - 2.5MB (.png) file -> 230kb (.jpg) file (delay is not calculated)
  - 300kb (.png) file -> 40kb (.jpg) file (delay is not calculated)
- [ ] Disk Usage and Size
- [ ] CPU Usage
- [ ] Response Times (CDN and API)
