


class POI:
    def __init__(self, name, image, coordinates, city, country):
        self.name = name
        self.image = image
        self.coordinates = coordinates
        self.city = city
        self.country = country

    def getName(self):
        return self.name
    def getImage(self):
        return self.image
    def getCoordinates(self):
        return self.coordinates
    def getCity(self):
        return self.city
    def getCountry(self):
        return self.country

    def setPOIname(self, name):
        self.name = name

    def setPOIimage(self, image):
        self.image = image

    def setPOIcoordinates(self, coordinates):
        self.coordinates = coordinates
    def setPOIcity(self, city):
        self.city = city
    def setPOIcountry(self, country):
        self.country = country