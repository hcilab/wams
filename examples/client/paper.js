paperInit = false;

paperRun = function(shape, centroid) {
	
	if (!paperInit)
	{
		//paper.install(window);
		// Get a reference to the canvas object
		var canvas = document.getElementById('main');

		// Create an empty project and a view for the canvas:
		paper.setup(canvas);
		
		paperInit = true;
	}
	if (shape === 'rectangle')
	{
		with(paper){
			var rectangle = new Rectangle(new Point(centroid.X - 50, centroid.Y - 25), new Point(centroid.X + 50, centroid.Y + 25));
			var path = new paper.Path.Rectangle(rectangle);
			path.fillColor = '#e9e9ff';
			path.strokeColor = 'black';
		}
	}
	else if (shape === 'circle')
	{
		with(paper)
		{
			var myCircle = new Path.Circle(new Point(centroid.X, centroid.Y), 50);
			myCircle.fillColor = 'tomato';
		}
	}

	else if (shape === 'triangle')
	{
		with(paper)
		{
			// Create a triangle shaped path
			var triangle = new Path.RegularPolygon(new Point(centroid.X, centroid.Y), 3, 50);
			triangle.fillColor = 'saffron';
		}
	}
	else
	{
		var path = new paper.Path();
		// Give the stroke a color
		path.strokeColor = 'black';
		var start = new paper.Point(centroid.X, centroid.Y);
		console.log(centroid);
		// Move to start and draw a line from there
		path.moveTo(start);
		// Note that the plus operator on Point objects does not work
		// in JavaScript. Instead, we need to call the add() function:
		path.lineTo(start.add([ 200, -50 ]));
		paper.view.draw();
	}
}
